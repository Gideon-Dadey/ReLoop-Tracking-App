import { Platform, TextStyle, ViewStyle } from 'react-native';
import { typography } from './fonts';

/** Native-style screen typography shared across the app (Inter). */
export const screenHeader = {
  /** Primary screen title (Activity, Research, Settings, etc.) */
  title: {
    fontSize: 22,
    letterSpacing: -0.3,
    ...typography.title,
  } satisfies TextStyle,

  /** Secondary line under a screen title */
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
    ...typography.subtitle,
  } satisfies TextStyle,

  /** In-screen section headings (Home dashboard sections, etc.) */
  sectionTitle: {
    fontSize: 17,
    letterSpacing: -0.2,
    ...typography.sectionTitle,
  } satisfies TextStyle,

  /** Stack navigator / native header bar title */
  navTitle: {
    fontSize: 17,
    ...typography.navTitle,
  } satisfies TextStyle,

  /** Modal and sheet titles */
  modalTitle: {
    fontSize: 20,
    letterSpacing: -0.3,
    ...typography.title,
  } satisfies TextStyle,

  /** Auth marketing headers — slightly larger but still native */
  authTitle: {
    fontSize: 24,
    letterSpacing: -0.4,
    ...typography.headline,
  } satisfies TextStyle,

  /** Empty state headings */
  emptyTitle: {
    fontSize: 17,
    letterSpacing: -0.2,
    ...typography.sectionTitle,
  } satisfies TextStyle,

  /** Standard top header container for full-screen pages */
  container: {
    paddingTop: Platform.OS === 'ios' ? 60 : 52,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } satisfies ViewStyle,
};

/** Use in Stack `headerTitleStyle` for consistent native nav titles. */
export const stackHeaderTitleStyle = screenHeader.navTitle;
