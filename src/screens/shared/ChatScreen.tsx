import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { UserRole } from '../../types';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { timeAgo } from '../../utils/helpers';

const POLL_INTERVAL = 4000; // 4s polling simulates real-time

export function ChatScreen({ route, navigation }: any) {
  const { ticketId } = route.params;
  const { user, tickets, getMessages, sendMessage, refreshMessages } = useStore();
  const ticket = tickets.find((t: any) => t.id === ticketId);

  const [text, setText]     = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const messages = getMessages(ticketId);

  // ── Poll for new messages every 4 seconds
  useEffect(() => {
    refreshMessages(ticketId);
    const interval = setInterval(() => refreshMessages(ticketId), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [ticketId]);

  // ── Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);
    await sendMessage(ticketId, content);
    setSending(false);
  }, [text, sending, ticketId, sendMessage]);

  const otherName = user?.role === UserRole.CLIENT
    ? (ticket?.technicianName ?? 'Técnico')
    : (ticket?.clientName ?? 'Cliente');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{otherName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{otherName}</Text>
            <Text style={styles.headerSub}>{ticket?.ticketNumber} · {ticket?.equipmentTitle ?? 'Chamado'}</Text>
          </View>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Nenhuma mensagem ainda</Text>
          <Text style={styles.emptySub}>Inicie a conversa sobre este chamado.</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isMe = item.senderId === user?.id;
            const prevMsg = messages[index - 1];
            const showName = !prevMsg || prevMsg.senderId !== item.senderId;
            return (
              <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
                {!isMe && showName && (
                  <Text style={styles.msgSenderName}>{item.senderName}</Text>
                )}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
                    {timeAgo(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
          activeOpacity={0.8}
        >
          {sending
            ? <ActivityIndicator size="small" color={Colors.white} />
            : <Ionicons name="send" size={18} color={Colors.white} />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 54 : Spacing.lg,
    paddingBottom: Spacing.md, paddingHorizontal: Spacing.base,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: Typography.base, fontWeight: '800', color: Colors.white },
  headerName: { fontSize: Typography.base, fontWeight: '700', color: Colors.white },
  headerSub: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.75)' },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.statusFinished, borderWidth: 2, borderColor: Colors.primary },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.xl },
  emptyTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center' },

  messageList: { padding: Spacing.base, paddingBottom: Spacing.xl },

  msgRow: { marginBottom: Spacing.sm, alignItems: 'flex-start', maxWidth: '80%' },
  msgRowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  msgSenderName: { fontSize: Typography.xs, color: Colors.textTertiary, marginBottom: 3, marginLeft: 4 },

  bubble: { borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, maxWidth: '100%' },
  bubbleMe:   { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, ...Shadows.sm },
  bubbleText: { fontSize: Typography.base, color: Colors.textPrimary, lineHeight: 20 },
  bubbleTextMe: { color: Colors.white },
  bubbleTime: { fontSize: 10, color: Colors.textTertiary, marginTop: 3, textAlign: 'right' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.65)' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    backgroundColor: Colors.white, padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.md,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  input: {
    flex: 1, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: Typography.base, color: Colors.textPrimary, maxHeight: 100,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
