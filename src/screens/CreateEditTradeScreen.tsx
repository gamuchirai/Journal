import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList, Trade } from '../types';
import { COLORS, FOREX_PAIRS, TIMEFRAMES, DEFAULT_CONTEXTS } from '../constants';
import { useTradeStore } from '../store';
import { processAndSaveImage, deleteTradeImages } from '../utils/imageUtils';
import * as db from '../database';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateEditTrade'>;

interface FormData {
  market: string;
  timeframe: string;
  bias: string;
  narrative: string;
  context: string;
  entry: string;
  stop: string;
  target: string;
  riskReward: string;
  pnl: string;
  whatWentRight: string;
  whatWentWrong: string;
}

const CreateEditTradeScreen = ({ navigation, route }: Props) => {
  const { tradeId } = route.params;
  const { saveTrade, loading } = useTradeStore();
  const insets = useSafeAreaInsets();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [loadingTrade, setLoadingTrade] = useState(!!tradeId);

  const { control, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {
      market: '',
      timeframe: '',
      bias: '',
      narrative: '',
      context: '',
      entry: '',
      stop: '',
      target: '',
      riskReward: '',
      pnl: '',
      whatWentRight: '',
      whatWentWrong: '',
    },
  });

  // Load preferences and existing trade if editing
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const prefs = await db.getUserPreferences();
        setPreferences(prefs);

        if (tradeId) {
          const existingTrade = await db.getTrade(tradeId);
          if (existingTrade) {
            setTrade(existingTrade);
            setScreenshotUri(existingTrade.screenshotUri);
            setThumbnailUri(existingTrade.thumbnailUri);
            reset({
              market: existingTrade.market,
              timeframe: existingTrade.timeframe,
              bias: existingTrade.bias,
              narrative: existingTrade.narrative,
              context: existingTrade.context,
              entry: existingTrade.entry,
              stop: existingTrade.risk.stop,
              target: existingTrade.risk.target,
              riskReward: existingTrade.risk.riskReward,
              pnl: existingTrade.pnl || '',
              whatWentRight: existingTrade.notes.whatWentRight || '',
              whatWentWrong: existingTrade.notes.whatWentWrong || '',
            });
          }
        } else {
          // Set defaults for new trade
          reset({
            timeframe: prefs.defaultTimeframe,
            market: prefs.recentMarkets[0] || FOREX_PAIRS[0],
            context: prefs.recentContexts[0] || DEFAULT_CONTEXTS[0],
          });
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        Alert.alert('Error', 'Failed to load preferences. Using defaults.');
        // Set fallback defaults
        setPreferences({
          defaultTimeframe: TIMEFRAMES[4],
          recentMarkets: FOREX_PAIRS.slice(0, 5),
          recentContexts: DEFAULT_CONTEXTS.slice(0, 5),
        });
      } finally {
        setLoadingTrade(false);
      }
    };

    loadInitialData();
  }, [tradeId]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const processedImages = await processAndSaveImage(result.assets[0].uri);
        setScreenshotUri(processedImages.fullUri);
        setThumbnailUri(processedImages.thumbnailUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = async () => {
    if (screenshotUri || thumbnailUri) {
      await deleteTradeImages(screenshotUri, thumbnailUri);
      setScreenshotUri(null);
      setThumbnailUri(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('=== SAVE TRADE CLICKED ===');
    console.log('Form data:', JSON.stringify(data, null, 2));
    
    try {
      // Calculate Risk:Reward ratio
      let calculatedRR = '';
      if (data.entry && data.stop && data.target) {
        const entry = parseFloat(data.entry);
        const stop = parseFloat(data.stop);
        const target = parseFloat(data.target);
        
        if (!isNaN(entry) && !isNaN(stop) && !isNaN(target)) {
          const risk = Math.abs(entry - stop);
          const reward = Math.abs(target - entry);
          if (risk > 0) {
            const rrRatio = reward / risk;
            calculatedRR = `1:${rrRatio.toFixed(2)}`;
          }
        }
      }
      
      const newTrade: Trade = {
        id: trade?.id || `trade_${Date.now()}`,
        date: trade?.date || Date.now(),
        market: data.market,
        timeframe: data.timeframe,
        bias: data.bias,
        narrative: data.narrative,
        context: data.context,
        entry: data.entry,
        risk: {
          stop: data.stop,
          target: data.target,
          riskReward: calculatedRR,
        },
        status: trade?.status || 'draft',
        outcomes: trade?.outcomes || {
          biasPlayedOut: null,
          narrativePlayedOut: null,
          contextHeld: null,
          entryExecuted: null,
          riskManaged: null,
        },
        screenshotUri,
        thumbnailUri,
        pnl: data.pnl || null,
        notes: {
          whatWentRight: data.whatWentRight || null,
          whatWentWrong: data.whatWentWrong || null,
        },
      };

      console.log('New trade object:', JSON.stringify(newTrade, null, 2));
      console.log('Calling saveTrade...');
      await saveTrade(newTrade);
      console.log('saveTrade completed successfully');
      console.log('Navigating back...');
      navigation.goBack();
    } catch (error) {
      console.error('Error in onSubmit:', error);
      Alert.alert('Error', 'Failed to save trade');
    }
  };

  if (loadingTrade || !preferences) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Market Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Market</Text>
          <Controller
            control={control}
            name="market"
            render={({ field: { value, onChange } }) => (
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[...preferences.recentMarkets, ...FOREX_PAIRS]
                    .filter((m, i, arr) => arr.indexOf(m) === i)
                    .slice(0, 8)
                    .map((pair) => (
                      <TouchableOpacity
                        key={pair}
                        style={[
                          styles.pickerOption,
                          value === pair && styles.pickerOptionActive,
                        ]}
                        onPress={() => onChange(pair)}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            value === pair && styles.pickerOptionTextActive,
                          ]}
                        >
                          {pair}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}
          />
        </View>

        {/* Timeframe Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>Timeframe</Text>
          <Controller
            control={control}
            name="timeframe"
            render={({ field: { value, onChange } }) => (
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TIMEFRAMES.map((tf) => (
                    <TouchableOpacity
                      key={tf}
                      style={[
                        styles.pickerOption,
                        value === tf && styles.pickerOptionActive,
                      ]}
                      onPress={() => onChange(tf)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          value === tf && styles.pickerOptionTextActive,
                        ]}
                      >
                        {tf}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          />
        </View>

        {/* Bias */}
        <View style={styles.section}>
          <Text style={styles.label}>Bias</Text>
          <Controller
            control={control}
            name="bias"
            render={({ field: { value, onChange } }) => (
              <View style={styles.buttonGroupContainer}>
                {['Long', 'Short', 'Neutral'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.buttonGroup,
                      value === option && styles.buttonGroupActive,
                    ]}
                    onPress={() => onChange(option)}
                  >
                    <Text
                      style={[
                        styles.buttonGroupText,
                        value === option && styles.buttonGroupTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Narrative */}
        <View style={styles.section}>
          <Text style={styles.label}>Narrative</Text>
          <Controller
            control={control}
            name="narrative"
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={styles.input}
                placeholder="Enter narrative..."
                placeholderTextColor={COLORS.textLight}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        {/* Context */}
        <View style={styles.section}>
          <Text style={styles.label}>Context</Text>
          <Controller
            control={control}
            name="context"
            render={({ field: { value, onChange } }) => (
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[...preferences.recentContexts, ...DEFAULT_CONTEXTS]
                    .filter((c, i, arr) => arr.indexOf(c) === i)
                    .slice(0, 6)
                    .map((ctx) => (
                      <TouchableOpacity
                        key={ctx}
                        style={[
                          styles.pickerOption,
                          value === ctx && styles.pickerOptionActive,
                        ]}
                        onPress={() => onChange(ctx)}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            value === ctx && styles.pickerOptionTextActive,
                          ]}
                        >
                          {ctx}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}
          />
        </View>

        {/* Entry */}
        <View style={styles.section}>
          <Text style={styles.label}>Entry</Text>
          <Controller
            control={control}
            name="entry"
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={styles.input}
                placeholder="Enter entry price..."
                placeholderTextColor={COLORS.textLight}
                value={value}
                onChangeText={onChange}
                keyboardType="decimal-pad"
              />
            )}
          />
        </View>

        {/* Risk Management */}
        <View style={styles.section}>
          <Text style={styles.label}>Risk Management</Text>
          <Controller
            control={control}
            name="stop"
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={styles.input}
                placeholder="Stop Loss..."
                placeholderTextColor={COLORS.textLight}
                value={value}
                onChangeText={onChange}
                keyboardType="decimal-pad"
              />
            )}
          />
          <Controller
            control={control}
            name="target"
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={[styles.input, styles.marginTop]}
                placeholder="Target..."
                placeholderTextColor={COLORS.textLight}
                value={value}
                onChangeText={onChange}
                keyboardType="decimal-pad"
              />
            )}
          />
        </View>

        {/* Screenshot */}
        <View style={styles.section}>
          <Text style={styles.label}>Chart Screenshot</Text>
          {screenshotUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: screenshotUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
              <Text style={styles.uploadButtonText}>📷 Add Chart Screenshot</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Trade</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    marginRight: 8,
  },
  pickerOptionActive: {
    backgroundColor: COLORS.primary,
  },
  pickerOptionText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  pickerOptionTextActive: {
    color: COLORS.white,
  },
  buttonGroupContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonGroup: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
  },
  buttonGroupActive: {
    backgroundColor: COLORS.primary,
  },
  buttonGroupText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 12,
  },
  buttonGroupTextActive: {
    color: COLORS.white,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4,
    fontSize: 14,
    color: COLORS.text,
  },
  marginTop: {
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  uploadButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateEditTradeScreen;
