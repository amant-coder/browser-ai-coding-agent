package com.browserai.agent.service;

import com.browserai.agent.model.CreditLedger;
import com.browserai.agent.model.UsageEvent;
import com.browserai.agent.repository.CreditLedgerRepository;
import com.browserai.agent.repository.UsageEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class CreditService {

    private static final String BALANCE_KEY_PREFIX = "credits:balance:";

    private final CreditLedgerRepository creditLedgerRepository;
    private final UsageEventRepository usageEventRepository;
    private final StringRedisTemplate redisTemplate;

    public CreditService(CreditLedgerRepository creditLedgerRepository,
                         UsageEventRepository usageEventRepository,
                         StringRedisTemplate redisTemplate) {
        this.creditLedgerRepository = creditLedgerRepository;
        this.usageEventRepository = usageEventRepository;
        this.redisTemplate = redisTemplate;
    }

    public int getBalance(String userId) {
        String cacheKey = BALANCE_KEY_PREFIX + userId;
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return Integer.parseInt(cached);
        }
        int balance = creditLedgerRepository.findByUserId(userId)
                .map(CreditLedger::getBalance)
                .orElse(0);
        redisTemplate.opsForValue().set(cacheKey, String.valueOf(balance), Duration.ofMinutes(5));
        return balance;
    }

    @Transactional
    public int deductCredits(String userId, String action, int amount) {
        CreditLedger ledger = creditLedgerRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CreditLedger l = new CreditLedger(userId, 0);
                    return creditLedgerRepository.save(l);
                });

        if (ledger.getBalance() < amount) {
            throw new IllegalStateException("Insufficient credits: balance=" + ledger.getBalance() + ", required=" + amount);
        }

        int newBalance = ledger.getBalance() - amount;
        ledger.setBalance(newBalance);
        ledger.setLastUpdated(LocalDateTime.now());
        creditLedgerRepository.save(ledger);

        // Record usage event
        UsageEvent event = new UsageEvent(userId, action, amount);
        usageEventRepository.save(event);

        // Update cache
        String cacheKey = BALANCE_KEY_PREFIX + userId;
        redisTemplate.opsForValue().set(cacheKey, String.valueOf(newBalance), Duration.ofMinutes(5));

        return newBalance;
    }

    @Transactional
    public int addCredits(String userId, int amount) {
        CreditLedger ledger = creditLedgerRepository.findByUserId(userId)
                .orElseGet(() -> creditLedgerRepository.save(new CreditLedger(userId, 0)));

        int newBalance = ledger.getBalance() + amount;
        ledger.setBalance(newBalance);
        ledger.setLastUpdated(LocalDateTime.now());
        creditLedgerRepository.save(ledger);

        // Invalidate cache
        redisTemplate.delete(BALANCE_KEY_PREFIX + userId);
        return newBalance;
    }

    public Page<UsageEvent> getUsageHistory(String userId, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        if (from != null && to != null) {
            return usageEventRepository.findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                    userId, from, to, pageable);
        }
        return usageEventRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
}
