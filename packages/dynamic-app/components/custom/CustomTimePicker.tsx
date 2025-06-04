import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { parse, format } from "date-fns";
import { FaRegClock } from "react-icons/fa";
import CustomInput from "./CustomInput";

interface Props {
  formatString: string;        // e.g. "hh:mm aa" or "HH:mm"
  defaultValue?: string;       // formatted default time
  onChange: (date: Date | null) => void;
}

function TimeListWrapper({ children }: { children: React.ReactNode }) {
    const listRef = useRef<HTMLUListElement>(null);
    useEffect(() => {
      const el = listRef.current;
      if (!el) return;
      let ticker: number | null = null;
  
      function onMove(e: MouseEvent) {
        if (!el) return;
        const { top, height } = el.getBoundingClientRect();
        const y = e.clientY - top;
        if (y < 30) {
          if (!ticker) {
            ticker = window.setInterval(() => el.scrollBy(0, -2), 50);
          }
        } else if (y > height - 30) {
          if (!ticker) {
            ticker = window.setInterval(() => el.scrollBy(0, 2), 50);
          }
        } else {
          if (ticker) {
            clearInterval(ticker);
            ticker = null;
          }
        }
      }
  
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", () => {
        if (ticker) clearInterval(ticker);
        ticker = null;
      });
      return () => {
        el.removeEventListener("mousemove", onMove);
        if (ticker) clearInterval(ticker);
      };
    }, []);
  
    return (
      <ul ref={listRef} className="react-datepicker__time-list">
        {children}
      </ul>
    );
  }

export default function CustomTimePicker({ formatString, defaultValue, onChange }: Props) {
  const parsed = defaultValue
    ? parse(defaultValue, formatString, new Date())
    : new Date();

    const [selectedTime, setSelectedTime] = useState<Date>(parsed);
  return (
    <DatePicker
      selected={selectedTime}
      onChange={(date, event) => {
        if (date) {
            setSelectedTime(date);
            onChange?.(date);
        }
      }}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={1}
      dateFormat={formatString}
      customInput={
        <CustomInput
          icon={<FaRegClock size={16} />}
          placeholder={formatString}
        />
      }
      popperPlacement="bottom-start"
      popperContainer={({ children }) =>
        // Wrap the UL that react-datepicker creates for time options
        <TimeListWrapper>{children}</TimeListWrapper>
      }
    />
  );
}
