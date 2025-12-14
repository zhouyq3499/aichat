package com.zhouyq.aichat.model;

import com.volcengine.ark.runtime.model.completion.chat.ChatMessage;
import lombok.Data;

import java.util.List;

@Data
public class ChatRoom {
    private long roomId;
    private List<ChatMessage> chatMessage;

//    public void setChatMessage(List<ChatMessage> messages) {
//        this.chatMessages = messages;
//    }
}
