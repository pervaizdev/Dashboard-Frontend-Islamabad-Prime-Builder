import {
  BadgeDollarSign,
  CalendarDays,
  Cake,
  CreditCard,
  Rocket,
  Wallet,
  Plane,
} from "lucide-react";

export const paymentCards = [
  {
    title: "Total Amount",
    value: "PKR 12,500,000",
    subtitle: "Overall booked amount",
    icon: Wallet,
  },
  {
    title: "Paid Amount",
    value: "PKR 7,200,000",
    subtitle: "Amount received",
    icon: BadgeDollarSign,
  },
  {
    title: "Remaining Balance",
    value: "PKR 5,300,000",
    subtitle: "Pending payment",
    icon: CreditCard,
  },
  {
    title: "Next Installment",
    value: "20 Apr 2025",
    subtitle: "Due date reminder",
    icon: CalendarDays,
  },
];

export const announcements = [
  {
    id: 1,
    title: "Happy Birthday, Muhammad Huzaifa!",
    description: "Wishing Muhammad Huzaifa a wonderful birthday today! 🎉",
    date: "26 Mar",
    icon: Cake,
    highlighted: true,
  },
  {
    id: 2,
    title: "Launching Soon! ViSole Digital Office",
    description:
      "ViSole Digital Office is scheduled for launch soon! We eagerly welcome your feedback and input to ensure success and completion.",
    date: "19 Mar",
    icon: Rocket,
    highlighted: false,
  },
  {
    id: 3,
    title: "Eid-ul-Fitr Holidays Announcement",
    description:
      "Eid-ul-Fitr holidays will be observed from 20th March to 23rd March. Regular working operations will resume from 24th March.",
    date: "19 Mar",
    icon: Plane,
    highlighted: false,
  },
];