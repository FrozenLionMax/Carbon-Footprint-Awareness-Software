"use client"

import { useSpring, animated } from "react-spring"

export function AnimatedNumber({ 
  value, 
  decimals = 0, 
  prefix = "", 
  suffix = "" 
}: { 
  value: number; 
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    config: { mass: 1, tension: 170, friction: 26 },
  })

  return (
    <animated.span>
      {number.to((n) => `${prefix}${n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`)}
    </animated.span>
  )
}
