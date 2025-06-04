import { Icons, IconKey } from "@smartforms/shared/icons";

export interface SubMenu {
  header: string;
  columns: {
    label: string;
    href: string;
    icon: IconKey;
  }[][];
  promo?: {
    text: string;
    link: string;
    buttonText: string;
  };
}

export interface MenuItem {
  label: string;
  href?: string;
  isDropdown?: boolean;
  subMenu?: SubMenu[];
}

/* ✅ Menus Before Login */
export const publicMenu: MenuItem[] = [
  { label: "About", href: "/about" },
  // {
  //   label: "Products",
  //   isDropdown: true,
  //   subMenu: [
  //     {
  //       header: "PRODUCTS",
  //       columns: [
  //         [
  //           { label: "Form Designer", href: "/templates/forms", icon: "online-survey" },
  //           // { label: "App Templates", href: "/templates/apps", icon: "app-template" },
  //           // { label: "Table Templates", href: "/templates/tables", icon: "table-template" },
  //           // { label: "PDF Templates", href: "/templates/pdf", icon: "pdf-template" },
  //         ],
  //       //   [
  //       //     { label: "Card Form Templates", href: "/templates/card-forms", icon: "card-template" },
  //       //     { label: "Store Builder Templates", href: "/templates/stores", icon: "store-template" },
  //       //     { label: "Workflow Templates", href: "/templates/workflow", icon: "workflow-template" },
  //       //     { label: "Sign Templates", href: "/templates/sign", icon: "sign-template" },
  //       //   ],
  //       ],
  //       // promo: {
  //       //   text: "🚀 10+ AI Agent Templates",
  //       //   link: "/discover",
  //       //   buttonText: "Discover Now",
  //       // },
  //     },
  //   ],
  // },
  { label: "Pricing", href: "/pricing" },
//   {
//     label: "Templates",
//     isDropdown: true,
//     subMenu: [
//       {
//         header: "TEMPLATES",
//         columns: [
//           [
//             { label: "Form Templates", href: "/templates/forms", icon: "form-template" },
//             { label: "App Templates", href: "/templates/apps", icon: "app-template" },
//             { label: "Table Templates", href: "/templates/tables", icon: "table-template" },
//             { label: "PDF Templates", href: "/templates/pdf", icon: "pdf-template" },
//           ],
//           [
//             { label: "Card Form Templates", href: "/templates/card-forms", icon: "card-template" },
//             { label: "Store Builder Templates", href: "/templates/stores", icon: "store-template" },
//             { label: "Workflow Templates", href: "/templates/workflow", icon: "workflow-template" },
//             { label: "Sign Templates", href: "/templates/sign", icon: "sign-template" },
//           ],
//         ],
//         promo: {
//           text: "🚀 10+ AI Agent Templates",
//           link: "/discover",
//           buttonText: "Discover Now",
//         },
//       },
//     ],
//   },
  { label: "Contact", href: "/contact" },
  { label: "Docs", href: "/docs" },
  { label: "FAQ", href: "/faq" },
];

/* ✅ Menus After Login */
export const privateMenu: MenuItem[] = [
  { label: "Contact", href: "/contactus" },
  { label: "Docs", href: "/docs" },
  { label: "FAQ", href: "/faq" },
];