export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;
};

export type ParentStackParamList = {
  Home: undefined;
  NannyDetail: { nannyId: string };
  Hiring: undefined;
  Favorites: undefined;
  Messages: undefined;
  ChatRoom: { chatId: string };
  SearchFilters: { filters: object; onApply: (f: object) => void };
};

export type NannyStackParamList = {
  Requests: undefined;
  Jobs: undefined;
  Messages: undefined;
  ChatRoom: { chatId: string };
  EditProfile: undefined;
};

export type ParentTabParamList = {
  Search: undefined;
  Hiring: undefined;
  Favorites: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type NannyTabParamList = {
  Requests: undefined;
  Jobs: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  ParentMain: undefined;
  NannyMain: undefined;
};
