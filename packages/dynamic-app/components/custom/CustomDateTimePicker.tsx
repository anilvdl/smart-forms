import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { parse, format } from "date-fns";
// import { FaRegCalendarAlt, FaRegClock } from "react-icons/fa";
import { Calendar } from "lucide-react";
import CustomInput from "./CustomInput";

interface Props {
  formatString: string;        // e.g. "MM/dd/yyyy, hh:mm aa"
  defaultValue?: string;       // formatted default date-time
  onChange: (date: Date | null) => void;
}

export default function CustomDateTimePicker({ formatString, defaultValue, onChange }: Props) {
  const parsed = defaultValue
    ? parse(defaultValue, formatString, new Date())
    : new Date();
    const [selectedDateTime, setSelectedDateTime] = useState<Date>(parsed);
    
  return (
    <DatePicker
      selected={selectedDateTime}
      onChange={(date) => {
        if (date) {
            setSelectedDateTime(date);
            onChange?.(date);
        }
      }}
      showTimeSelect
      timeIntervals={1}
      dateFormat={formatString}
      customInput={
        <CustomInput
          icon={(
            <span style={{ display: "flex", gap: "0.5em" }}>
              <Calendar size={16} />
              {/* <FaRegClock size={16} /> */}
            </span>
          )}
          placeholder={formatString}
        />
      }
      popperPlacement="bottom-start"
    />
  );
}
