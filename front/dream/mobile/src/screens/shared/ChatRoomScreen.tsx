import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, IconButton, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../../services/endpoints';
import {
  joinChat, leaveChat, sendMessage, onNewMessage,
  startTyping, stopTyping, onTypingStart, onTypingStop,
} from '../../services/socket';
import { useAppSelector } from '../../hooks/redux';
import { colors, spacing, borderRadius } from '../../theme';
import { ParentStackParamList } from '../../navigation/types';
import { Message } from '../../types';

type Props = NativeStackScreenProps<ParentStackParamList, 'ChatRoom'>;

export const ChatRoomScreen: React.FC<Props> = ({ route }) => {
  const { chatId } = route.params;
  const user = useAppSelector((s) => s.auth.user);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { data } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => chatApi.getMessages(chatId).then((r) => r.data.data),
  });

  useEffect(() => {
    if (data) setMessages(data);
  }, [data]);

  useEffect(() => {
    joinChat(chatId);
    const unsubMsg = onNewMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    const unsubTyping = onTypingStart(() => setTyping(true));
    const unsubStop = onTypingStop(() => setTyping(false));

    return () => {
      leaveChat(chatId);
      unsubMsg?.();
      unsubTyping?.();
      unsubStop?.();
    };
  }, [chatId]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage({ chatId, content: text.trim() });
    setText('');
    stopTyping(chatId);
  };

  const handleChangeText = (val: string) => {
    setText(val);
    if (val) startTyping(chatId);
    else stopTyping(chatId);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender._id === user?._id;
    return (
      <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.msgText, isMine && styles.myText]}>{item.content}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      {typing && <Text style={styles.typing}>Typing...</Text>}
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={handleChangeText}
          placeholder="Type a message..."
          style={styles.input}
          mode="outlined"
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />
        <IconButton icon="send" iconColor={colors.primary} onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md },
  bubble: { maxWidth: '75%', padding: spacing.sm + 4, borderRadius: borderRadius.lg, marginBottom: spacing.sm },
  myBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface },
  msgText: { color: colors.text },
  myText: { color: colors.white },
  typing: { paddingHorizontal: spacing.md, color: colors.textSecondary, fontSize: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.surface },
});
