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
import { RootStackParamList, Trade, BiasData, NarrativeData, EntryData, Direction } from '../types';
import { COLORS, FOREX_PAIRS, TIMEFRAMES, PD_ARRAYS, CONTEXT_AREAS, ENTRY_PATTERNS, DIRECTIONS, DEFAULT_CONTEXTS } from '../constants';
import { useTradeStore } from '../store';
import { processAndSaveImage, deleteTradeImages } from '../utils/imageUtils';
import * as db from '../database';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateEditTrade'>;

interface FormData {
  market: string;
  timeframe: string;
  // Bias fields
  biasDirection: Direction;
  biasPdArray: string;
  biasTimeframe: string;
  biasPlayedOut: boolean | null;
  // Narrative fields
  narrativeContextArea: string;
  narrativePdArray: string;
  narrativeTimeframe: string;
  narrativePlayedOut: boolean | null;
  // Entry fields
  entryPattern: string;
  entryTimeframe: string;
  entryPlayedOut: boolean | null;
  // Risk
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
      // Bias defaults
      biasDirection: 'Long',
      biasPdArray: '',
      biasTimeframe: '',
      biasPlayedOut: null,
      // Narrative defaults
      narrativeContextArea: '',
      narrativePdArray: '',
      narrativeTimeframe: '',
      narrativePlayedOut: null,
      // Entry defaults
      entryPattern: '',
      entryTimeframe: '',
      entryPlayedOut: null,
      // Risk
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
            
            // Handle both new structured format and legacy string format
            const bias = existingTrade.bias as BiasData | string;
            const narrative = existingTrade.narrative as NarrativeData | string;
            const entry = existingTrade.entry as EntryData | string;
            
            reset({
              market: existingTrade.market,
              timeframe: existingTrade.timeframe,
              // Bias fields
              biasDirection: typeof bias === 'object' ? bias.direction : 'Long',
              biasPdArray: typeof bias === 'object' ? bias.pdArray : '',
              biasTimeframe: typeof bias === 'object' ? bias.timeframe : '',
              biasPlayedOut: typeof bias === 'object' ? bias.playedOut : null,
              // Narrative fields
              narrativeContextArea: typeof narrative === 'object' ? narrative.contextArea : '',
              narrativePdArray: typeof narrative === 'object' ? narrative.pdArray : '',
              narrativeTimeframe: typeof narrative === 'object' ? narrative.timeframe : '',
              narrativePlayedOut: typeof narrative === 'object' ? narrative.playedOut : null,
              // Entry fields
              entryPattern: typeof entry === 'object' ? entry.entryPattern : '',
              entryTimeframe: typeof entry === 'object' ? entry.timeframe : '',
              entryPlayedOut: typeof entry === 'object' ? entry.playedOut : null,
              // Risk
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
            biasDirection: 'Long',
            biasPdArray: PD_ARRAYS[0],
            biasTimeframe: prefs.defaultTimeframe,
            narrativeContextArea: CONTEXT_AREAS[0],
            narrativePdArray: PD_ARRAYS[0],
            narrativeTimeframe: prefs.defaultTimeframe,
            entryPattern: ENTRY_PATTERNS[0],
            entryTimeframe: prefs.defaultTimeframe,
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
      if (data.stop && data.target) {
        const stop = parseFloat(data.stop);
        const target = parseFloat(data.target);
        
        // Simple R:R calculation based on difference
        if (!isNaN(stop) && !isNaN(target) && stop !== target) {
          // This is a simplified calculation - user should input proper values
          calculatedRR = data.riskReward || '';
        }
      }
      
      // Build structured bias
      const biasData: BiasData = {
        direction: data.biasDirection,
        pdArray: data.biasPdArray,
        timeframe: data.biasTimeframe,
        playedOut: data.biasPlayedOut,
      };
      
      // Build structured narrative
      const narrativeData: NarrativeData = {
        contextArea: data.narrativeContextArea,
        pdArray: data.narrativePdArray,
        timeframe: data.narrativeTimeframe,
        playedOut: data.narrativePlayedOut,
      };
      
      // Build structured entry
      const entryData: EntryData = {
        entryPattern: data.entryPattern,
        timeframe: data.entryTimeframe,
        playedOut: data.entryPlayedOut,
      };
      
      const newTrade: Trade = {
        id: trade?.id || `trade_${Date.now()}`,
        date: trade?.date || Date.now(),
        market: data.market,
        timeframe: data.timeframe,
        bias: biasData,
        narrative: narrativeData,
        entry: entryData,
        risk: {
          stop: data.stop,
          target: data.target,
          riskReward: calculatedRR || data.riskReward,
        },
        status: trade?.status || 'draft',
        outcomes: trade?.outcomes || {
          biasPlayedOut: data.biasPlayedOut,
          narrativePlayedOut: data.narrativePlayedOut,
          contextHeld: null,
          entryExecuted: data.entryPlayedOut,
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

        {/* ===== BIAS SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>📊 Bias</Text>
            <Controller
              control={control}
              name="biasPlayedOut"
              render={({ field: { value, onChange } }) => (
                <View style={styles.playedOutToggle}>
                  <Text style={styles.playedOutLabel}>Played Out?</Text>
                  <View style={styles.playedOutButtons}>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === true && styles.playedOutBtnYes]}
                      onPress={() => onChange(value === true ? null : true)}
                    >
                      <Text style={[styles.playedOutBtnText, value === true && styles.playedOutBtnTextActive]}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === false && styles.playedOutBtnNo]}
                      onPress={() => onChange(value === false ? null : false)}
                    >
                      <Text style={[styles.playedOutBtnText, value === false && styles.playedOutBtnTextActive]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
          
          {/* Direction */}
          <Text style={styles.subLabel}>Direction</Text>
          <Controller
            control={control}
            name="biasDirection"
            render={({ field: { value, onChange } }) => (
              <View style={styles.buttonGroupContainer}>
                {DIRECTIONS.map((option) => (
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
          
          {/* PD Array for Bias */}
          <Text style={[styles.subLabel, styles.marginTop]}>PD Array</Text>
          <Controller
            control={control}
            name="biasPdArray"
            render={({ field: { value, onChange } }) => (
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {PD_ARRAYS.map((pda) => (
                    <TouchableOpacity
                      key={pda}
                      style={[
                        styles.pickerOption,
                        value === pda && styles.pickerOptionActive,
                      ]}
                      onPress={() => onChange(pda)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          value === pda && styles.pickerOptionTextActive,
                        ]}
                      >
                        {pda}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          />
          
          {/* Timeframe for Bias */}
          <Text style={[styles.subLabel, styles.marginTop]}>Timeframe</Text>
          <Controller
            control={control}
            name="biasTimeframe"
            render={({ field: { value, onChange } }) => (
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TIMEFRAMES.map((tf) => (
                    <TouchableOpacity
                      key={tf}
                      style={[
                        styles.pickerOptionSmall,
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

        {/* ===== NARRATIVE SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>📖 Narrative</Text>
            <Controller
              control={control}
              name="narrativePlayedOut"
              render={({ field: { value, onChange } }) => (
                <View style={styles.playedOutToggle}>
                  <Text style={styles.playedOutLabel}>Played Out?</Text>
                  <View style={styles.playedOutButtons}>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === true && styles.playedOutBtnYes]}
                      onPress={() => onChange(value === true ? null : true)}
                    >
                      <Text style={[styles.playedOutBtnText, value === true && styles.playedOutBtnTextActive]}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === false && styles.playedOutBtnNo]}
                      onPress={() => onChange(value === false ? null : false)}
                    >
                      <Text style={[styles.playedOutBtnText, value === false && styles.playedOutBtnTextActive]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
          
          {/* Context Area */}
          <Text style={styles.subLabel}>Context Area</Text>
          <Controller
            control={control}
            name="narrativeContextArea"
            render={({ field: { value, onChange } }) => (
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CONTEXT_AREAS.map((ctx) => (
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
          
          {/* PD Array for Narrative */}
          <Text style={[styles.subLabel, styles.marginTop]}>PD Array</Text>
          <Controller
            control={control}
            name="narrativePdArray"
            render={({ field: { value, onChange } }) => (
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {PD_ARRAYS.map((pda) => (
                    <TouchableOpacity
                      key={pda}
                      style={[
                        styles.pickerOption,
                        value === pda && styles.pickerOptionActive,
                      ]}
                      onPress={() => onChange(pda)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          value === pda && styles.pickerOptionTextActive,
                        ]}
                      >
                        {pda}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          />
          
          {/* Timeframe for Narrative */}
          <Text style={[styles.subLabel, styles.marginTop]}>Timeframe</Text>
          <Controller
            control={control}
            name="narrativeTimeframe"
            render={({ field: { value, onChange } }) => (
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TIMEFRAMES.map((tf) => (
                    <TouchableOpacity
                      key={tf}
                      style={[
                        styles.pickerOptionSmall,
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

        {/* ===== ENTRY SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>🎯 Entry</Text>
            <Controller
              control={control}
              name="entryPlayedOut"
              render={({ field: { value, onChange } }) => (
                <View style={styles.playedOutToggle}>
                  <Text style={styles.playedOutLabel}>Played Out?</Text>
                  <View style={styles.playedOutButtons}>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === true && styles.playedOutBtnYes]}
                      onPress={() => onChange(value === true ? null : true)}
                    >
                      <Text style={[styles.playedOutBtnText, value === true && styles.playedOutBtnTextActive]}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === false && styles.playedOutBtnNo]}
                      onPress={() => onChange(value === false ? null : false)}
                    >
                      <Text style={[styles.playedOutBtnText, value === false && styles.playedOutBtnTextActive]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
          
          {/* Entry Pattern */}
          <Text style={styles.subLabel}>Entry Pattern</Text>
          <Controller
            control={control}
            name="entryPattern"
            render={({ field: { value, onChange } }) => (
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {ENTRY_PATTERNS.map((pattern) => (
                    <TouchableOpacity
                      key={pattern}
                      style={[
                        styles.pickerOption,
                        value === pattern && styles.pickerOptionActive,
                      ]}
                      onPress={() => onChange(pattern)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          value === pattern && styles.pickerOptionTextActive,
                        ]}
                      >
                        {pattern}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          />
          
          {/* Timeframe for Entry */}
          <Text style={[styles.subLabel, styles.marginTop]}>Timeframe</Text>
          <Controller
            control={control}
            name="entryTimeframe"
            render={({ field: { value, onChange } }) => (
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TIMEFRAMES.map((tf) => (
                    <TouchableOpacity
                      key={tf}
                      style={[
                        styles.pickerOptionSmall,
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
  // New Section Card Style for Building Blocks
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 6,
  },
  // Played Out Toggle Styles
  playedOutToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playedOutLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  playedOutButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  playedOutBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playedOutBtnYes: {
    backgroundColor: COLORS.success,
  },
  playedOutBtnNo: {
    backgroundColor: COLORS.error,
  },
  playedOutBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  playedOutBtnTextActive: {
    color: COLORS.white,
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
  pickerOptionSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    marginRight: 6,
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
