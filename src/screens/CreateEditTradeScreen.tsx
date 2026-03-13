import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import {
  BarChart3,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  Image as ImageIcon,
  LocateFixed,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList, Trade, BiasData, NarrativeData, EntryData, Direction } from '../types';
import { FOREX_PAIRS, TIMEFRAMES, PD_ARRAYS, CONTEXT_AREAS, ENTRY_PATTERNS, DIRECTIONS, DEFAULT_CONTEXTS } from '../constants';
import { C } from '../constants/Colors';
import { T, S, cardShadow, amberShadow } from '../constants/Styles';
import { useTradeStore } from '../store';
import {
  processAndSaveImage,
  deleteTradeImages,
  logImageUriDebug,
  normalizeImageUri,
} from '../utils/imageUtils';
import { SectionTitle, ScreenLoadingState, SelectPickerModal, MarketSearchInput } from '../components';
import { calculateRiskRewardRatio } from '../utils/riskUtils';
import * as db from '../database';
import {
  MIN_BIAS_TIMEFRAME_INDEX,
  getTimeframeIndex,
  getLowerTimeframes,
  isStrictlyLowerTimeframe,
  getDefaultHierarchyTimeframes,
} from '../utils/timeframeUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateEditTrade'>;

interface FormData {
  market: string;
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
  contextHeld: boolean | null;
  // Entry fields
  entryPattern: string;
  entryTimeframe: string;
  entryPlayedOut: boolean | null;
  riskManaged: boolean | null;
  // Risk
  stop: string;
  target: string;
  riskReward: string;
  pnl: string;
  whatWentRight: string;
  whatWentWrong: string;
}

type SelectField =
  | 'market'
  | 'biasPdArray'
  | 'narrativePdArray'
  | 'biasTimeframe'
  | 'narrativeTimeframe'
  | 'entryPattern'
  | 'entryTimeframe';

const LBarChart3 = BarChart3 as React.ComponentType<any>;
const LBookOpen = BookOpen as React.ComponentType<any>;
const LCamera = Camera as React.ComponentType<any>;
const LCheck = Check as React.ComponentType<any>;
const LChevronDown = ChevronDown as React.ComponentType<any>;
const LLocateFixed = LocateFixed as React.ComponentType<any>;
const LShieldCheck = ShieldCheck as React.ComponentType<any>;
const LX = X as React.ComponentType<any>;
const LImageIcon = ImageIcon as React.ComponentType<any>;

const CreateEditTradeScreen = ({ navigation, route }: Props) => {
  const { tradeId } = route.params;
  const { saveTrade, loading } = useTradeStore();
  const insets = useSafeAreaInsets();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [loadingTrade, setLoadingTrade] = useState(!!tradeId);
  const [activeSelect, setActiveSelect] = useState<{
    visible: boolean;
    field: SelectField;
    title: string;
    options: string[];
  } | null>(null);

  // Refs for tracking newly picked images so they can be cleaned up if the user
  // navigates away without saving.
  const tradeSavedRef = useRef(false);
  const newlyPickedRef = useRef(false);
  const pendingImageRef = useRef<{ screenshot: string | null; thumbnail: string | null }>({ screenshot: null, thumbnail: null });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      market: '',
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
      contextHeld: null,
      // Entry defaults
      entryPattern: '',
      entryTimeframe: '',
      entryPlayedOut: null,
      riskManaged: null,
      // Risk
      stop: '',
      target: '',
      riskReward: '',
      pnl: '',
      whatWentRight: '',
      whatWentWrong: '',
    },
  });

  const biasTimeframe = watch('biasTimeframe');
  const narrativeTimeframe = watch('narrativeTimeframe');
  const entryTimeframe = watch('entryTimeframe');

  const biasTimeframeOptions = useMemo(
    () => TIMEFRAMES.filter((_, index) => index >= MIN_BIAS_TIMEFRAME_INDEX),
    []
  );

  const narrativeTimeframeOptions = useMemo(() => {
    if (!biasTimeframe) return [];
    return getLowerTimeframes(biasTimeframe).filter((timeframe) => getTimeframeIndex(timeframe) >= 1);
  }, [biasTimeframe]);

  const entryTimeframeOptions = useMemo(() => {
    if (!narrativeTimeframe) return [];
    return getLowerTimeframes(narrativeTimeframe);
  }, [narrativeTimeframe]);

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
            const normalizedScreenshot = normalizeImageUri(existingTrade.screenshotUri);
            const normalizedThumbnail = normalizeImageUri(existingTrade.thumbnailUri);
            console.log('[CreateEditTradeScreen] loaded existing trade image URIs', {
              tradeId,
              screenshotUri: existingTrade.screenshotUri,
              thumbnailUri: existingTrade.thumbnailUri,
              normalizedScreenshot,
              normalizedThumbnail,
            });
            await logImageUriDebug('CreateEdit.existing.screenshotUri', existingTrade.screenshotUri);
            await logImageUriDebug('CreateEdit.existing.thumbnailUri', existingTrade.thumbnailUri);
            setScreenshotUri(normalizedScreenshot);
            setThumbnailUri(normalizedThumbnail);
            
            // Handle both new structured format and legacy string format
            const bias = existingTrade.bias as BiasData | string;
            const narrative = existingTrade.narrative as NarrativeData | string;
            const entry = existingTrade.entry as EntryData | string;
            
            reset({
              market: existingTrade.market,
              // Bias fields
              biasDirection: typeof bias === 'object' ? bias.direction : 'Long',
              biasPdArray: typeof bias === 'object' ? bias.pdArray : '',
              biasTimeframe: typeof bias === 'object' ? bias.timeframe : '',
              biasPlayedOut: typeof bias === 'object' ? (bias.playedOut ?? null) : null,
              // Narrative fields
              narrativeContextArea: typeof narrative === 'object' ? narrative.contextArea : '',
              narrativePdArray: typeof narrative === 'object' ? narrative.pdArray : '',
              narrativeTimeframe: typeof narrative === 'object' ? narrative.timeframe : '',
              narrativePlayedOut: typeof narrative === 'object' ? (narrative.playedOut ?? null) : null,
              contextHeld: existingTrade.outcomes.contextHeld ?? null,
              // Entry fields
              entryPattern: typeof entry === 'object' ? entry.entryPattern : '',
              entryTimeframe: typeof entry === 'object' ? entry.timeframe : '',
              entryPlayedOut: typeof entry === 'object' ? (entry.playedOut ?? null) : null,
              riskManaged: existingTrade.outcomes.riskManaged ?? null,
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
          const defaultHierarchy = getDefaultHierarchyTimeframes(prefs.defaultTimeframe);
          reset({
            market: prefs.recentMarkets[0] || FOREX_PAIRS[0],
            biasDirection: 'Long',
            biasPdArray: PD_ARRAYS[0],
            biasTimeframe: defaultHierarchy.biasTimeframe,
            narrativeContextArea: CONTEXT_AREAS[0],
            narrativePdArray: PD_ARRAYS[0],
            narrativeTimeframe: defaultHierarchy.narrativeTimeframe,
            entryPattern: ENTRY_PATTERNS[0],
            entryTimeframe: defaultHierarchy.entryTimeframe,
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

  useEffect(() => {
    if (!biasTimeframeOptions.includes(biasTimeframe)) {
      setValue('biasTimeframe', biasTimeframeOptions[0] || '', { shouldDirty: true });
    }
  }, [biasTimeframe, biasTimeframeOptions, setValue]);

  useEffect(() => {
    const fallbackNarrative =
      narrativeTimeframeOptions[narrativeTimeframeOptions.length - 1] || '';

    if (!narrativeTimeframeOptions.includes(narrativeTimeframe)) {
      setValue('narrativeTimeframe', fallbackNarrative, { shouldDirty: true });
    }
  }, [narrativeTimeframe, narrativeTimeframeOptions, setValue]);

  useEffect(() => {
    const fallbackEntry = entryTimeframeOptions[entryTimeframeOptions.length - 1] || '';

    if (!entryTimeframeOptions.includes(entryTimeframe)) {
      setValue('entryTimeframe', fallbackEntry, { shouldDirty: true });
    }
  }, [entryTimeframe, entryTimeframeOptions, setValue]);

  // Clean up newly picked images if the user navigates away without saving.
  useEffect(() => {
    return () => {
      if (!tradeSavedRef.current && newlyPickedRef.current) {
        deleteTradeImages(pendingImageRef.current.screenshot, pendingImageRef.current.thumbnail).catch(() => {});
      }
    };
  }, []);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[CreateEditTradeScreen] picked image asset', {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          fileName: result.assets[0].fileName,
        });
        const processedImages = await processAndSaveImage(result.assets[0].uri);
        const normalizedFull = normalizeImageUri(processedImages.fullUri);
        const normalizedThumb = normalizeImageUri(processedImages.thumbnailUri);
        await logImageUriDebug('CreateEdit.processed.fullUri', normalizedFull);
        await logImageUriDebug('CreateEdit.processed.thumbnailUri', normalizedThumb);
        setScreenshotUri(normalizedFull);
        setThumbnailUri(normalizedThumb);
        newlyPickedRef.current = true;
        pendingImageRef.current = { screenshot: normalizedFull, thumbnail: normalizedThumb };
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
      newlyPickedRef.current = false;
      pendingImageRef.current = { screenshot: null, thumbnail: null };
    }
  };

  const openSelect = (field: SelectField, title: string, options: string[]) => {
    setActiveSelect({ visible: true, field, title, options });
  };

  const closeSelect = () => {
    setActiveSelect(null);
  };

  const handleSelectOption = (value: string) => {
    if (!activeSelect) return;
    setValue(activeSelect.field, value as any, { shouldDirty: true });
    closeSelect();
  };

  const onSubmit = async (data: FormData) => {
    console.log('=== SAVE TRADE CLICKED ===');
    console.log('Form data:', JSON.stringify(data, null, 2));
    
    try {
      if (!isStrictlyLowerTimeframe(data.narrativeTimeframe, data.biasTimeframe)) {
        Alert.alert(
          'Invalid Timeframe Alignment',
          'Narrative timeframe must be lower than bias timeframe.'
        );
        return;
      }

      if (!isStrictlyLowerTimeframe(data.entryTimeframe, data.narrativeTimeframe)) {
        Alert.alert(
          'Invalid Timeframe Alignment',
          'Entry timeframe must be lower than narrative timeframe.'
        );
        return;
      }

      // Calculate Risk:Reward ratio
      const calculatedRR = calculateRiskRewardRatio(data.stop || null, data.target || null) || data.riskReward || '';
      
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

      const currentStatus = trade?.status || 'active';
      const allMetricsFilled =
        data.biasPlayedOut != null &&
        data.narrativePlayedOut != null &&
        data.contextHeld != null &&
        data.entryPlayedOut != null &&
        data.riskManaged != null;
      const nextStatus = allMetricsFilled ? 'closed' : 'active';
      
      const newTrade: Trade = {
        id: trade?.id || `trade_${Date.now()}`,
        date: trade?.date || Date.now(),
        market: data.market,
        timeframe: data.biasTimeframe || '',
        bias: biasData,
        narrative: narrativeData,
        entry: entryData,
        risk: {
          stop: data.stop,
          target: data.target,
          riskReward: calculatedRR || data.riskReward,
        },
        status: nextStatus,
        outcomes: {
          biasPlayedOut: data.biasPlayedOut,
          narrativePlayedOut: data.narrativePlayedOut,
          contextHeld: data.contextHeld,
          entryExecuted: data.entryPlayedOut,
          riskManaged: data.riskManaged,
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
      tradeSavedRef.current = true;
      navigation.goBack();
    } catch (error) {
      console.error('Error in onSubmit:', error);
      Alert.alert('Error', 'Failed to save trade');
    }
  };

  if (loadingTrade || !preferences) {
    return <ScreenLoadingState />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
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
        {/* Market Select */}
        <View style={[styles.sectionCard, { zIndex: 10 }]}>
          <View style={styles.sectionHeader}>
            <SectionTitle Icon={LBarChart3} label="Market" />
          </View>
          <Controller
            control={control}
            name="market"
            rules={{ required: 'Select a market before saving.' }}
            render={({ field: { value, onChange } }) => (
              <MarketSearchInput
                value={value}
                onChange={onChange}
                suggestions={[
                  ...preferences.recentMarkets,
                  ...FOREX_PAIRS,
                ].filter((m: string, i: number, arr: string[]) => arr.indexOf(m) === i)}
                hasError={!!errors.market}
              />
            )}
          />
          {errors.market && <Text style={styles.fieldError}>{errors.market.message}</Text>}
        </View>



        {/* ===== BIAS SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <SectionTitle Icon={LBarChart3} label="Bias" />
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
                      <LCheck size={14} strokeWidth={2.8} style={{ color: value === true ? C.text : C.textDim }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === false && styles.playedOutBtnNo]}
                      onPress={() => onChange(value === false ? null : false)}
                    >
                      <LX size={14} strokeWidth={2.8} style={{ color: value === false ? C.text : C.textDim }} />
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
          
          {/* PD Array + Timeframe side by side */}
          <View style={[styles.selectRow, styles.marginTop]}>
            <View style={styles.selectHalf}>
              <Text style={styles.subLabel}>PD Array</Text>
              <Controller
                control={control}
                name="biasPdArray"
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() => openSelect('biasPdArray', 'Select Bias PD Array', PD_ARRAYS)}
                  >
                    <Text style={styles.selectBoxText}>{value || 'Choose'}</Text>
                    <LChevronDown size={16} strokeWidth={2.2} style={{ color: C.textMuted }} />
                  </TouchableOpacity>
                )}
              />
            </View>
            <View style={styles.selectHalf}>
              <Text style={styles.subLabel}>Timeframe</Text>
              <Controller
                control={control}
                name="biasTimeframe"
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() =>
                      openSelect('biasTimeframe', 'Select Bias Timeframe', biasTimeframeOptions)
                    }
                  >
                    <Text style={styles.selectBoxText}>{value || 'Choose'}</Text>
                    <LChevronDown size={16} strokeWidth={2.2} style={{ color: C.textMuted }} />
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>

        {/* ===== NARRATIVE SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <SectionTitle Icon={LBookOpen} label="Narrative" />
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
                      <LCheck size={14} strokeWidth={2.8} style={{ color: value === true ? C.text : C.textDim }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === false && styles.playedOutBtnNo]}
                      onPress={() => onChange(value === false ? null : false)}
                    >
                      <LX size={14} strokeWidth={2.8} style={{ color: value === false ? C.text : C.textDim }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>

          {/* PD Array + Timeframe side by side */}
          <View style={[styles.selectRow, styles.marginTop]}>
            <View style={styles.selectHalf}>
              <Text style={styles.subLabel}>PD Array</Text>
              <Controller
                control={control}
                name="narrativePdArray"
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() => openSelect('narrativePdArray', 'Select Narrative PD Array', PD_ARRAYS)}
                  >
                    <Text style={styles.selectBoxText}>{value || 'Choose'}</Text>
                    <LChevronDown size={16} strokeWidth={2.2} style={{ color: C.textMuted }} />
                  </TouchableOpacity>
                )}
              />
            </View>
            <View style={styles.selectHalf}>
              <Text style={styles.subLabel}>Timeframe</Text>
              <Controller
                control={control}
                name="narrativeTimeframe"
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() => {
                      if (narrativeTimeframeOptions.length === 0) {
                        Alert.alert('Select Bias Timeframe', 'Choose a higher bias timeframe first.');
                        return;
                      }

                      openSelect(
                        'narrativeTimeframe',
                        'Select Narrative Timeframe',
                        narrativeTimeframeOptions
                      );
                    }}
                  >
                    <Text style={styles.selectBoxText}>{value || 'Choose'}</Text>
                    <LChevronDown size={16} strokeWidth={2.2} style={{ color: C.textMuted }} />
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>

        {/* ===== CONTEXT SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <SectionTitle Icon={LBookOpen} label="Context" />
            <Controller
              control={control}
              name="contextHeld"
              render={({ field: { value, onChange } }) => (
                <View style={styles.playedOutToggle}>
                  <Text style={styles.playedOutLabel}>Held?</Text>
                  <View style={styles.playedOutButtons}>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === true && styles.playedOutBtnYes]}
                      onPress={() => onChange(value === true ? null : true)}
                    >
                      <LCheck size={14} strokeWidth={2.8} style={{ color: value === true ? C.text : C.textDim }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === false && styles.playedOutBtnNo]}
                      onPress={() => onChange(value === false ? null : false)}
                    >
                      <LX size={14} strokeWidth={2.8} style={{ color: value === false ? C.text : C.textDim }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>

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
        </View>

        {/* ===== ENTRY SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <SectionTitle Icon={LLocateFixed} label="Entry" />
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
                      <LCheck size={14} strokeWidth={2.8} style={{ color: value === true ? C.text : C.textDim }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === false && styles.playedOutBtnNo]}
                      onPress={() => onChange(value === false ? null : false)}
                    >
                      <LX size={14} strokeWidth={2.8} style={{ color: value === false ? C.text : C.textDim }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
          
          {/* Entry Pattern + Timeframe side by side */}
          <View style={[styles.selectRow, styles.marginTop]}>
            <View style={styles.selectHalf}>
              <Text style={styles.subLabel}>Pattern</Text>
              <Controller
                control={control}
                name="entryPattern"
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() => openSelect('entryPattern', 'Select Entry Pattern', ENTRY_PATTERNS)}
                  >
                    <Text style={styles.selectBoxText}>{value || 'Choose'}</Text>
                    <LChevronDown size={16} strokeWidth={2.2} style={{ color: C.textMuted }} />
                  </TouchableOpacity>
                )}
              />
            </View>
            <View style={styles.selectHalf}>
              <Text style={styles.subLabel}>Timeframe</Text>
              <Controller
                control={control}
                name="entryTimeframe"
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() => {
                      if (entryTimeframeOptions.length === 0) {
                        Alert.alert(
                          'Select Narrative Timeframe',
                          'Choose a higher narrative timeframe first.'
                        );
                        return;
                      }

                      openSelect('entryTimeframe', 'Select Entry Timeframe', entryTimeframeOptions);
                    }}
                  >
                    <Text style={styles.selectBoxText}>{value || 'Choose'}</Text>
                    <LChevronDown size={16} strokeWidth={2.2} style={{ color: C.textMuted }} />
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>

        {/* ===== RISK MANAGEMENT SECTION ===== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <SectionTitle Icon={LShieldCheck} label="Risk Management" />
            <Controller
              control={control}
              name="riskManaged"
              render={({ field: { value, onChange } }) => (
                <View style={styles.playedOutToggle}>
                  <Text style={styles.playedOutLabel}>Managed?</Text>
                  <View style={styles.playedOutButtons}>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === true && styles.playedOutBtnYes]}
                      onPress={() => onChange(value === true ? null : true)}
                    >
                      <LCheck size={14} strokeWidth={2.8} style={{ color: value === true ? C.text : C.textDim }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.playedOutBtn, value === false && styles.playedOutBtnNo]}
                      onPress={() => onChange(value === false ? null : false)}
                    >
                      <LX size={14} strokeWidth={2.8} style={{ color: value === false ? C.text : C.textDim }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
          <View style={styles.selectRow}>
            <View style={styles.selectHalf}>
              <Text style={styles.subLabel}>Stop Loss</Text>
              <Controller
                control={control}
                name="stop"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={C.textMuted}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>
            <View style={styles.selectHalf}>
              <Text style={styles.subLabel}>Target</Text>
              <Controller
                control={control}
                name="target"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={C.textMuted}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>
          </View>
        </View>

        {/* Screenshot */}
        <View style={styles.sectionCard}>
          <View style={[styles.sectionHeader, { marginBottom: screenshotUri ? 12 : 0 }]}>
            <SectionTitle Icon={LCamera} label="Chart Screenshot" />
          </View>
          {screenshotUri ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: screenshotUri }}
                style={styles.previewImage}
                onLoad={() =>
                  console.log('[CreateEditTradeScreen] preview image onLoad', {
                    tradeId,
                    screenshotUri,
                    thumbnailUri,
                  })
                }
                onError={(event) =>
                  console.error('[CreateEditTradeScreen] preview image onError', {
                    tradeId,
                    screenshotUri,
                    thumbnailUri,
                    error: event.nativeEvent.error,
                  })
                }
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
              >
                <LX size={16} strokeWidth={2.8} style={{ color: '#ffffff' }} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
              <View style={styles.uploadButtonRow}>
                <LCamera size={16} strokeWidth={2.2} style={{ color: C.textMuted }} />
                <Text style={styles.uploadButtonText}>Add Chart Screenshot</Text>
              </View>
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
            <ActivityIndicator color={C.elevated} />
          ) : (
            <Text style={styles.saveButtonText}>Save Trade</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

        <SelectPickerModal
          visible={!!activeSelect?.visible}
          title={activeSelect?.title || ''}
          options={activeSelect?.options || []}
          onSelect={handleSelectOption}
          onClose={closeSelect}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
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
  sectionCard: {
    backgroundColor: C.elevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 16,
    ...cardShadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: C.teal,
  },
  subLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: C.textMuted,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  playedOutToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playedOutLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: C.textDim,
  },
  playedOutButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  playedOutBtn: {
    width: 32,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playedOutBtnYes: {
    borderColor: 'rgba(26,138,106,0.3)',
    backgroundColor: C.gainDim,
  },
  playedOutBtnNo: {
    borderColor: 'rgba(192,66,74,0.3)',
    backgroundColor: C.lossDim,
  },
  playedOutBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: C.textDim,
  },
  playedOutBtnTextActive: {
    color: C.text,
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    color: C.teal,
    marginBottom: 8,
  },
  selectBox: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectBoxError: {
    borderColor: C.loss,
    borderWidth: 1.5,
  },
  fieldError: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: C.loss,
    marginTop: 4,
  },
  selectBoxText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: C.text,
  },
  selectBoxChevron: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: C.textMuted,
  },
  selectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectHalf: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    marginRight: 8,
  },
  pickerOptionSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    marginRight: 6,
  },
  pickerOptionActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  pickerOptionText: {
    fontFamily: 'DMSans_500Medium',
    color: C.textMuted,
    fontSize: 12,
  },
  pickerOptionTextActive: {
    color: '#ffffff',
  },
  buttonGroupContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonGroup: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    alignItems: 'center',
  },
  buttonGroupActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  buttonGroupText: {
    fontFamily: 'DMSans_600SemiBold',
    color: C.textMuted,
    fontSize: 12,
  },
  buttonGroupTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: C.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 4,
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: C.text,
  },
  marginTop: {
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: C.surface,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.loss,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: C.border,
  },
  uploadButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    fontFamily: 'DMSans_500Medium',
    color: C.textMuted,
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: C.amber,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    ...amberShadow,
  },
  saveButtonText: {
    fontFamily: 'DMSans_700Bold',
    color: '#ffffff',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});

export default CreateEditTradeScreen;
