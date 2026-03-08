package com.browserai.agent.repository;

import com.browserai.agent.model.UsageEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface UsageEventRepository extends JpaRepository<UsageEvent, String> {
    Page<UsageEvent> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Page<UsageEvent> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String userId, LocalDateTime from, LocalDateTime to, Pageable pageable);
}
