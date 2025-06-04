import React from "react";
import DefaultEditor from "./DefaultEditor";
import LogoEditor from "./LogoEditor";
import LongTextEditor  from "./LongTextEditor";
import ShortTextEditor from "./ShortTextEditor";
import { EditorProps } from "./types";
import SingleChoiceEditor from "./SingleChoiceEditor";
import MultipleChoiceEditor from "./MultipleChoiceEditor";
import DropdownEditor from "./DropdownEditor";
import DateEditor from "./DateEditor";
import TimeEditor from "./TimeEditor";
import DateTimeEditor from "./DateTimeEditor";
import { Label } from "@headlessui/react";
import LabelEditor from "./LabelEditor";

// A map of type => Editor component
const  allPropertiesEditorsMap: Record<string, React.FC<EditorProps>> = {
    logo: LogoEditor,
    text: ShortTextEditor,
    textarea: LongTextEditor,
    // Choice inputs
    radio:      SingleChoiceEditor,
    checkbox:   MultipleChoiceEditor,
    select:     DropdownEditor,

    // Date & Time inputs
    date:       DateEditor,
    time:       TimeEditor,
    "datetime-local": DateTimeEditor,
    label: LabelEditor,

    default: DefaultEditor,
};

export default allPropertiesEditorsMap;