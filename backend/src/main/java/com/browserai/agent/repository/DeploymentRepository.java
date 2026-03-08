package com.browserai.agent.repository;

import com.browserai.agent.model.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, String> {
    List<Deployment> findByUserIdOrderByCreatedAtDesc(String userId);
}
