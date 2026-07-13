package com.ewaste.dto;

import com.ewaste.model.Notification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private boolean isRead;
    private Long requestId;

    public static NotificationResponseDTO from(Notification entity) {
        return NotificationResponseDTO.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .description(entity.getDescription())
            .createdAt(entity.getCreatedAt())
            .isRead(entity.isRead())
            .requestId(entity.getRequestId())
            .build();
    }
}
