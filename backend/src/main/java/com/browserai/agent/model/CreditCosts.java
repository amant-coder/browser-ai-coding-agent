package com.browserai.agent.model;

/**
 * Credit cost constants for each agent action type.
 */
public final class CreditCosts {

    private CreditCosts() {}

    public static final int PLAN_STEP     = 2;
    public static final int ACT_STEP      = 3;
    public static final int OBSERVE_STEP  = 1;
    public static final int WEB_SEARCH    = 2;
    public static final int DEPLOY        = 10;
}
