from __future__ import annotations


class LLMService:
    def generate_explanation(self, stock_data: dict[str, object]) -> str:
        ticker = str(stock_data["ticker"])
        signal = str(stock_data["signal"])
        sector = str(stock_data["sector"])
        expected_return = float(stock_data["expected_return"])
        risk_score = float(stock_data["risk_score"])
        volatility = str(stock_data["volatility"])
        liquidity = str(stock_data["liquidity"])
        confidence = float(stock_data["confidence"])

        if signal == "BUY":
            stance = "The model sees a favorable upside-to-risk trade-off."
        elif signal == "HOLD":
            stance = "The setup is balanced, with limited edge relative to the risk profile."
        else:
            stance = "The downside and execution risks currently outweigh expected upside."

        return (
            f"{ticker} in the {sector} sector is rated {signal}. {stance} "
            f"The 5-day expected return is {expected_return:.2f}% with a risk score of {risk_score:.2f}/10 "
            f"and model confidence at {confidence:.0f}%. Current volatility is {volatility.lower()} and "
            f"market liquidity is {liquidity.lower()}, which directly shapes how aggressively the platform "
            f"would size this exposure."
        )
