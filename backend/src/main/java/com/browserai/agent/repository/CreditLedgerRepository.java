package com.browserai.agent.repository;

import com.browserai.agent.model.CreditLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CreditLedgerRepository extends JpaRepository<CreditLedger, String> {
    Optional<CreditLedger> findByUserId(String userId);
}
