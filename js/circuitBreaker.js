export class CircuitBreaker {
  constructor(action, failureThreshold = 3, timeout = 10000) {
    this.action = action;
    this.failureThreshold = failureThreshold;
    this.timeout = timeout;
    this.failures = 0;
    this.state = "CLOSED";
    this.nextAttempt = Date.now();
  }

  async fire(...args) {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextAttempt) {
        this.state = "HALF";
      } else {
        throw new Error("Servicio temporalmente no disponible.");
      }
    }

    try {
      const result = await this.action(...args);
      this.success();
      return result;
    } catch (error) {
      this.fail();
      throw error;
    }
  }

  success() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  fail() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
