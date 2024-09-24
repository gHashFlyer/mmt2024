import React, { useState, useEffect } from "react";

import "./PositionCalc.css";

import Header from "../components/Header";

const PositionCalc = (props) => {

    const [equity, setEquity] = useState(10000)
    const [riskPercent, setRiskPercent] = useState(0.5)
    const [data, setData] = useState(false);
    const [shares, setShares] = useState(false)
    const [stoploss, setStoploss] = useState(false)
    const [stoplossPercent, setStoplossPercent] = useState(false)
    const [equityPercent, setEquityPercent] = useState(false)
    const [takeProfit, setTakeProfit] = useState(false)
    const [riskRewardRatio, setRiskRewardRatio] = useState(false)

    useEffect(() => {
        let x = localStorage.getItem("data")
        if(x){
            x = JSON.parse(x)
            if(x.info){
                console.log(x)
                setData(x)
            }
        }

        x = JSON.parse(localStorage.getItem("poscalc"))
        if(x){
            if(x.equity){
                const equity = x.equity
                setEquity(equity)
                const riskp = x.risk_percent
                setRiskPercent(riskp)
            }
        }
        console.log(x)
      return () => {}
    }, [])

    function handleForm(e){
        e.preventDefault();
        let equity = e.target.equity.value
        let riskp = e.target.risk_percent.value
        let riskValue = equity * riskp/100
        let price = e.target.entry_price.value
        let atr = data.technicals.atr
        let sdtr = data.technicals.sdtr

        let sl = price - (atr + 2 * sdtr)


        // Limit stop loss to no more than 8% loss
        let slp = (sl - price) / price

        console.log(slp)
        if(slp < -0.080){
            console.log(sl)
            sl = 0.92 * price
            slp = (sl - price) / price
        }


        
        sl = Math.round(sl*100,2)/100
        slp = Math.round(10*100*Math.abs(slp))/10 //percent loss

        console.log(slp)

        let snum = Math.round(riskValue / (price - sl))

        let cost = snum * price
        let pct_equity = Math.round(10*  (100*cost/equity)  ) / 10
        
        // limit size of trade to 10% of equity
        if(pct_equity > 10){
            riskValue = equity * 0.10
            snum = Math.round(riskValue / price )
            slp = (sl - price) / price
            if(slp < -0.080){
                sl = 0.92 * price
            }
            sl = Math.round(sl*100,2)/100
            slp = Math.round(10*100*Math.abs(slp))/10 //percent loss            

            cost = snum * price
            pct_equity = Math.round(10*  (100*cost/equity)  ) / 10            
        }

        // calculate a take profit price such that it will increase
        // equity by one percent
        let tp = ( cost  +  (0.01 * equity) ) / snum
        tp = Math.round(tp * 100)/100
        setTakeProfit(tp)
    
        // calculate risk to reward ratio
        let risk = price - sl
        let reward = tp - price
        let rr = reward / risk
        rr = Math.round(100 * rr) / 100
        setRiskRewardRatio(rr)
        console.log(slp)

        setShares(snum)
        setStoploss(sl)
        setStoplossPercent(slp)
        setEquityPercent(pct_equity)

        
        
        const pscData = {equity: equity, risk_percent: riskp, cost: cost, pct_equity:pct_equity, takeprofit: takeProfit}

        console.log(pscData)
        localStorage.setItem("poscalc", JSON.stringify(pscData) );
    }    


    return(
    <React.Fragment>
        <div className="poscalc">
            <Header page="PositionCalc"/>
            
            <div className="poscalc-body">
                {!data && <div className="poscalc-form-header"> No Ticker </div>}
                {data &&
                
                <form className="poscalc-form" onSubmit={handleForm}>

                    <div className="poscalc-form-header"> {data.info.ticker} {data.technicals.price}</div>

                    {shares && 
                        <div>
                            <div className="poscalc-form-result">Shares: {shares} ({equityPercent}%)</div>
                            <div className="poscalc-form-result">S/L {stoploss}  ({stoplossPercent}%)</div>
                            <div className="poscalc-form-result">TP {takeProfit} R:{riskRewardRatio}</div>
                        </div>
                    }
                    {/* {!shares && 
                        <div>
                            <div className="poscalc-form-result"></div>
                            <div className="poscalc-form-result"></div>
                            <div className="poscalc-form-result"></div>
                        </div>
                    }                    
 */}
                    <button className="poscalc-form-button">CALCULATE</button>

                    <div className="poscalc-form-label">Entry Price</div>
                    <input required className="poscalc-form-input" type="text" placeholder="entry price" id="entry" name="entry_price"  defaultValue={data.technicals.price}/>

                    <div className="poscalc-form-label">Trading Equity</div>
                    <input autoFocus required className="poscalc-form-input" type="text" placeholder="trading equity" id="equity" name="equity" defaultValue={equity} />

                    <div className="poscalc-form-label">Equity Risk (%)</div>
                    <input required className="poscalc-form-input" type="text" placeholder="percent risk" id="riskpercent" name="risk_percent" defaultValue={riskPercent} />



                    
                </form>
                }

                

            </div>

        </div>

    </React.Fragment>)
}


export default PositionCalc;
