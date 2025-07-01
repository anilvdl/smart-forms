import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { parse, format } from "date-fns";
// import { FaRegCalendarAlt } from "react-icons/fa";
import { Calendar } from "lucide-react";
import CustomInput from "./CustomInput";

interface Props {
  formatString: string;         // e.g. "MM/dd/yyyy"
  defaultValue?: string;        // formatted default date
  onChange: (date: Date | null) => void;
}

export default function CustomDatePicker({ formatString, defaultValue, onChange }: Props) {
  // parse the formatted defaultValue into a Date, fallback to today
    const parsed = defaultValue
        ? parse(defaultValue, formatString, new Date())
        : new Date();

    // 2) Keep it in local state so picks “stick”
    const [selectedDate, setSelectedDate] = useState<Date>(parsed);

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => {
            if (date) {
            setSelectedDate(date);
            onChange?.(date);
            }
      }}
      dateFormat={formatString}
      customInput={
        <CustomInput
          icon={<Calendar size={16} />}
          placeholder={formatString}
        />
      }
      popperPlacement="bottom-start"
    />
  );
}
