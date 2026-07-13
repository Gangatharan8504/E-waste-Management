package com.ewaste.service;

import com.ewaste.dto.NotificationResponseDTO;
import com.ewaste.model.Notification;
import com.ewaste.model.User;
import com.ewaste.repository.NotificationRepository;
import com.ewaste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final UserRepository userRepo;

    @Transactional
    public void createNotification(User user, String title, String description, Long requestId) {
        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .description(description)
            .isRead(false)
            .requestId(requestId)
            .build();
        notificationRepo.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getUserNotifications(String email) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepo.findByUserOrderByCreatedAtDesc(user).stream()
            .map(NotificationResponseDTO::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepo.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long id, String email) {
        Notification notification = notificationRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }
        notification.setRead(true);
        notificationRepo.save(notification);
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> unread = notificationRepo.findByUserOrderByCreatedAtDesc(user).stream()
            .filter(n -> !n.isRead())
            .collect(Collectors.toList());
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepo.saveAll(unread);
    }

    @Transactional
    public void deleteNotification(Long id, String email) {
        Notification notification = notificationRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }
        notificationRepo.delete(notification);
    }
}
