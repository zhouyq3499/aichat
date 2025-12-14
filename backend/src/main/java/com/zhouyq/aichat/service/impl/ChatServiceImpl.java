package com.zhouyq.aichat.service.impl;

import com.volcengine.ark.runtime.model.completion.chat.ChatMessage;
import com.volcengine.ark.runtime.model.completion.chat.ChatMessageRole;
import com.zhouyq.aichat.model.ChatRoom;
import com.zhouyq.aichat.service.AiManage;
import com.zhouyq.aichat.service.ChatService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatServiceImpl implements ChatService {

    @Resource
    private AiManage aiManager;

    Map<Long, List<ChatMessage>> chatHistories = new HashMap<>();

    @Override
    public String doChat(long roomId, String userPrompt) {
        // 从历史中获取消息列表；若为空则初始化并放入 map
        List<ChatMessage> messages = chatHistories.get(roomId);
        if (messages == null) {
            messages = new ArrayList<>();
            chatHistories.put(roomId, messages);
        }

        // 构造并保存用户消息
        final ChatMessage userMessage = ChatMessage.builder()
                .role(ChatMessageRole.USER)
                .content(userPrompt)
                .build();
        messages.add(userMessage);

        // 调用 AI 服务生成回复
        String answer = aiManager.doChat(messages);
        if (answer == null) {
            answer = "no answer from AI";
        }

        // 构造并保存 AI 回复
        final ChatMessage answerMessage = ChatMessage.builder()
                .role(ChatMessageRole.ASSISTANT)
                .content(answer)
                .build();
        messages.add(answerMessage);

        // 如果回复包含“游戏结束”，清理会话
        if (answer.contains("游戏结束")) {
            chatHistories.remove(roomId);
        }

        return answer;
    }

    @Override
    public List<ChatRoom> getChatRoomList() {
        List<ChatRoom> chatRoomList = new ArrayList<>();
        for (Map.Entry<Long, List<ChatMessage>> entry : chatHistories.entrySet()) {
            ChatRoom chatRoom = new ChatRoom();
            chatRoom.setRoomId(entry.getKey());
            List<ChatMessage> messages = entry.getValue();
            chatRoom.setChatMessage(messages);
            chatRoomList.add(chatRoom);
        }
        return chatRoomList;
    }
}