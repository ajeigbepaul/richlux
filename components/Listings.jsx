import React from "react";
import LisitingItem from "./LisitingItem";
const listingitem = [
  {
    id: 1,
    image: "/images/hero4.jpg",
    otherimages: [],
    title: "Pent house roof top",
    description:
      "new pent houserooftop terrace swimming poolcinema high ceiling contemporary design all rooms ensuite fitted kitchen modern finishing dinning area pantry laundry area high ceiling drop chandeliers spot lights led lighting family lounge bq gym double walk-in closet",
    price: 17000000,
    posted: "21-Aug-2023",
    available: "Yes",
    time: "4:00 pm",
  },
  {
    id: 2,
    image: "/images/hero2.jpg",
    otherimages: [],
    title: "Pent house roof top",
    description:
      "new pent houserooftop terrace swimming poolcinema high ceiling contemporary design all rooms ensuite fitted kitchen modern finishing dinning area pantry laundry area high ceiling drop chandeliers spot lights led lighting family lounge bq gym double walk-in closet",
    price: 4500000,
    posted: "21-Aug-2023",
    available: "Yes",
    time: "4:00 pm",
  },
  {
    id: 3,
    image: "/images/hero1.jpg",
    otherimages: [],
    title: "Pent house roof top",
    description:
      "new pent houserooftop terrace swimming poolcinema high ceiling contemporary design all rooms ensuite fitted kitchen modern finishing dinning area pantry laundry area high ceiling drop chandeliers spot lights led lighting family lounge bq gym double walk-in closet",
    price: 5000000,
    posted: "21-Aug-2023",
    available: "Yes",
    time: "4:00 pm",
  },
  {
    id: 4,
    image: "/images/hero5.jpg",
    otherimages: [],
    title: "Pent house roof top",
    description:
      "new pent houserooftop terrace swimming poolcinema high ceiling contemporary design all rooms ensuite fitted kitchen modern finishing dinning area pantry laundry area high ceiling drop chandeliers spot lights led lighting family lounge bq gym double walk-in closet",
    price: 5000000,
    posted: "21-Aug-2023",
    available: "Yes",
    time: "4:00 pm",
  },
  {
    id: 5,
    image: "/images/hero3.jpg",
    otherimages: [],
    title: "Pent house roof top",
    description:
      "new pent houserooftop terrace swimming poolcinema high ceiling contemporary design all rooms ensuite fitted kitchen modern finishing dinning area pantry laundry area high ceiling drop chandeliers spot lights led lighting family lounge bq gym double walk-in closet",
    price: 5400000,
    posted: "21-Aug-2023",
    available: "Yes",
    time: "4:00 pm",
  },
  {
    id: 6,
    image: "/images/hero1.jpg",
    otherimages: [],
    title: "Pent house roof top",
    description:
      "new pent houserooftop terrace swimming poolcinema high ceiling contemporary design all rooms ensuite fitted kitchen modern finishing dinning area pantry laundry area high ceiling drop chandeliers spot lights led lighting family lounge bq gym double walk-in closet",
    price: 55000000,
    posted: "21-Aug-2023",
    available: "Yes",
    time: "4:00 pm",
  },
];
function Listings() {
  return (
    <div className="bg-gray-900 py-5 space-y-5">
      <div className="w-full flex flex-col items-center justify-center pt-10">
        <h1 className="text-3xl text-orange-300">Properties</h1>
        <span className="text-sm text-white">Your comfort and safety</span>
      </div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 px-4 py-5">
        {listingitem.map((listing) => (
          <LisitingItem key={listing.id} listingitem={listing} />
        ))}
      </div>
    </div>
  );
}

export default Listings;
