import apple              from "./assets/icons/apple.png";
import blankForm          from "./assets/icons/blank-form.png";
import button             from "./assets/icons/button.png";
import choice             from "./assets/icons/choice.png";
import colorPicker        from "./assets/icons/color-picker.png";
import dateTime           from "./assets/icons/date-time.png";
import date               from "./assets/icons/date.png";
import divider            from "./assets/icons/divider.png";
import draft              from "./assets/icons/draft.png";
import dropdown           from "./assets/icons/dropdown.png";
import email              from "./assets/icons/email.png";
import error              from "./assets/icons/error.png";
import errorComputer      from "./assets/icons/error-computer.png";
import eventRegistration  from "./assets/icons/event-registration.png";
import facebook           from "./assets/icons/facebook.png";
import favorite           from "./assets/icons/favorite.png";
import fileUpload         from "./assets/icons/file-upload.png";
import form1              from "./assets/icons/form1.png";
import formsDesign        from "./assets/icons/forms_design.png";
import favicon            from "./assets/icons/favicon.png";
import sf_logo_icon      from "./assets/icons/sf_logo_icon.png";
import google             from "./assets/icons/google.png";
import header             from "./assets/icons/header.png";
import hidden             from "./assets/icons/hidden.png";
import image              from "./assets/icons/image.png";
import krish              from "./assets/icons/krish.png";
import linkedin           from "./assets/icons/linkedin.png";
import longText           from "./assets/icons/long-text.png";
import label              from "./assets/icons/label.png";
import m4uicon            from "./assets/icons/m4u-icon.png";
import murthyastro        from "./assets/icons/murthy-astro.png";
import master             from "./assets/icons/master.png";
import microsoft          from "./assets/icons/microsoft.png";
import multiChoice        from "./assets/icons/multi-choice.png";
import number             from "./assets/icons/number.png";
import onlineSurvey       from "./assets/icons/online-survey.png";
import pageBreak          from "./assets/icons/page-break.png";
import partyInvite        from "./assets/icons/party-invite.png";
import password           from "./assets/icons/password.png";
import range              from "./assets/icons/range.png";
import recommended        from "./assets/icons/recommended.png";
import reset              from "./assets/icons/reset.png";
import rsvp               from "./assets/icons/rsvp.png";
import salesforce         from "./assets/icons/salesforce.png";
import search             from "./assets/icons/search.png";
import sfLogo             from "./assets/icons/sf_logo.png";
import submit             from "./assets/icons/submit.png";
import submit1            from "./assets/icons/submit1.png";
import table              from "./assets/icons/table.png";
import tel                from "./assets/icons/tel.png";
import text               from "./assets/icons/text.png";
import time               from "./assets/icons/time.png";
import url                from "./assets/icons/url.png";
import video              from "./assets/icons/video.png";
import herobg             from "./assets/icons/hero-bg.jpg";

export const Icons = {
  "":"",
  apple,
  "blank-form":    blankForm,
  button,
  choice,
  "color-picker":  colorPicker,
  "date-time":     dateTime,
  date,
  divider,
  draft,
  dropdown,
  email,
  "event-registration": eventRegistration,
  error,
  "error-computer": errorComputer,
  facebook,
  favorite,
  favicon,
  "file-upload":   fileUpload,
  form1,
  "forms_design":  formsDesign,
  sf_logo_icon:  sf_logo_icon,
  google,
  header,
  "hero-bg" : herobg,
  hidden,
  image,
  linkedin,
  label,
  krish,
  "long-text":     longText,
  m4uicon,
  murthyastro,
  master,
  microsoft,
  "multi-choice":  multiChoice,
  number,
  "online-survey": onlineSurvey,
  "page-break":    pageBreak,
  "party-invite":  partyInvite,
  password,
  range,
  recommended,
  reset,
  rsvp,
  salesforce,
  search,
  sf_logo:        sfLogo,
  submit,
  submit1,
  table,
  tel,
  text,
  time,
  url,
  video,
} as const;

export type IconKey = keyof typeof Icons;