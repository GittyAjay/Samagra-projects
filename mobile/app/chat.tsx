import { MaterialIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/components/providers/session-provider';
import { useToast } from '@/components/providers/toast-provider';
import { fetchSupportConversation, sendSupportMessage } from '@/lib/api';
import { useSolarTheme } from '@/constants/solar-theme';
import type { ApiSupportChatMessage } from '@/types/api';

function formatChatTimestamp(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ChatScreen() {
  const colors = useSolarTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { effectiveUser } = useSession();
  const { showToast } = useToast();
  const scrollRef = useRef<ScrollView | null>(null);
  const [messages, setMessages] = useState<ApiSupportChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      const conversation = await fetchSupportConversation(effectiveUser);
      setMessages(conversation.messages);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Could not load chat',
        message: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUser, showToast]);

  useFocusEffect(
    useCallback(() => {
      void loadConversation();
    }, [loadConversation])
  );

  async function handleSend() {
    const trimmed = chatInput.trim();

    if (!trimmed || isSending) {
      return;
    }

    try {
      setIsSending(true);
      const conversation = await sendSupportMessage(effectiveUser, trimmed);
      setMessages(conversation.messages);
      setChatInput('');
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Message not sent',
        message: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          onContentSizeChange={scrollToBottom}>
          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.statusDot, { backgroundColor: colors.successText }]} />
            <Text style={[styles.statusText, { color: colors.text }]}>Support specialist online</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.subtle }]}>Loading conversation...</Text>
            </View>
          ) : (
            messages.map((message) => {
              const isUser = message.author === 'user';

              return (
                <View
                  key={message.id}
                  style={[
                    styles.chatBubbleWrap,
                    isUser ? styles.chatBubbleWrapUser : styles.chatBubbleWrapSupport,
                  ]}>
                  <View
                    style={[
                      styles.chatBubble,
                      {
                        backgroundColor: isUser ? colors.primary : colors.surface,
                        borderColor: isUser ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text style={[styles.chatBubbleText, { color: isUser ? colors.onPrimary : colors.text }]}>
                      {message.text}
                    </Text>
                  </View>
                  <Text style={[styles.chatTimestamp, { color: colors.subtle }]}>
                    {formatChatTimestamp(message.createdAt)}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>

        <View
          style={[
            styles.composer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 14),
            },
          ]}>
          <TextInput
            value={chatInput}
            onChangeText={setChatInput}
            placeholder="Write your message"
            placeholderTextColor={colors.subtle}
            style={[
              styles.chatInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            returnKeyType="send"
            onSubmitEditing={() => void handleSend()}
          />
          <Pressable
            onPress={() => void handleSend()}
            style={[styles.sendButton, { backgroundColor: colors.primary }]}>
            {isSending ? (
              <ActivityIndicator color={colors.onPrimary} size="small" />
            ) : (
              <MaterialIcons name="send" size={18} color={colors.onPrimary} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  messagesScroll: {
    flex: 1,
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chatBubbleWrap: {
    maxWidth: '84%',
  },
  chatBubbleWrapUser: {
    alignSelf: 'flex-end',
  },
  chatBubbleWrapSupport: {
    alignSelf: 'flex-start',
  },
  chatBubble: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chatBubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatTimestamp: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  composer: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
