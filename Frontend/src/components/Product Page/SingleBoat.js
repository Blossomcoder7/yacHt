import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DateRangePicker } from "react-date-range";
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Navbar from "../LandingPage/Navbar";
import Footer from "../LandingPage/Footer";
import Slider from "react-slick";
import "./SingleBoat.css";
import img1 from "../../images/boat1.png";
import img2 from "../../images/boat2.png";
import img3 from "../../images/boat3.png";
import img4 from "../../images/boat4.png";
import img5 from "../../images/boat5.png";
import img6 from "../../images/boat6.png";
import star from "../../images/star.svg";
import { NavLink } from "react-router-dom";
import { httpAPI } from '../../AxiosApi';
import { useNavigate } from "react-router-dom";


export default function SingleBoat() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const currentDate = new Date();
  const [openDate, setOpenDate] = useState(false);
  const [numberDays, setNumberDays] = useState(1);
  const [multiDay, setMultiDay] = useState(false);
  const [singleDay, setSingleDay] = useState(true);
  const [openTime, setOpenTime] = useState(false);
  const [time, setTime] = useState("1 hour");
  const [passanger, setPassanger] = useState({ passanger: "" });
  const [open, setOpen] = useState(false);
  const [requestButton, setRequestButton] = useState();
  const [openPasanger, setOpenPasanger] = useState(false);
  const [interval, setInterval] = useState([]);
  const [bookedDates, setBookeddates] = useState([]);
  const [startTime, setStartTime] = useState("Please enter start time");
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const navigate = useNavigate();


  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
  };

  const pickTime = (e) => {
    setTime(e.currentTarget.textContent)
  }
  function generateHalfHourIntervals() {
    let startTime = '09:00:00';
    let endTime = '17:00:00';
    const intervals = [];
    const interval = 30;

    const startDate = new Date(`2023-10-17T${startTime}`);
    const endDate = new Date(`2023-10-17T${endTime}`);
    while (startDate < endDate) {
      const timeString = startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      intervals.push(timeString);
      startDate.setMinutes(startDate.getMinutes() + interval);
    }
    setInterval(intervals);
    return intervals;
  }
  const fetchData = async () => {
    try {
      const response = await httpAPI.get(`/boat/singleBoat/${id}`);
      setData(response.data.boat);
      setRequestButton(response.data.boat.bookingType);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    bookedDatesHandler();
    window.scrollTo(0,0);
  }, []);

  const inquiryHandel = async (e) => {
    e.preventDefault();
    if (data) {
      const ownerID = data.userId;
      console.log(ownerID)
      const inquiry = { date, time, startTime, passanger, id, ownerID };
      const quote = { adminEmail: "blossomcoder@gmail.com", Message: "New Inquiry" };

      try {
        const response = await httpAPI.post(`/inquiry/send`, inquiry);
        console.log(response.data);

        const response2 = await httpAPI.post(`/email/sendQuoteTOAdmin`, quote);
        console.log(response2.data);

        alert("Your Quote Send Successfully");
      } catch (error) {
        console.log("The Server Error", error);
      }
    } else {
      console.log("Data is not available yet.");
    }
  };

  const bookedDatesHandler = async () => {
    try {

      const response = await httpAPI.get(`/boat/bookedDates/${id}`);

      const formattedDates = response.data.bookedDates.map((date) => {
        const originalDate = new Date(date);
        return originalDate.toLocaleDateString('en-GB');
      });


      console.log(formattedDates);
      setBookeddates(formattedDates);

    } catch (error) {

    }
  }
  const formattedBookedDates = bookedDates.map(dateString => {
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPassanger((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSelect = (ranges) => {
    if (ranges.selection.startDate !== ranges.selection.endDate) {
      // User selected a range, reset the endDate to match startDate
      setDate([{
        startDate: ranges.selection.startDate,
        endDate: ranges.selection.startDate,
        key: 'selection',
      }]);
    } else {
      // User selected a single day
      setDate([ranges.selection]);
    }
  };
  function formatDateToDDMMYYYY(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const calculatePrice = (e) => {
    e.preventDefault();
    try {
      const productDetail = {
        id: id,
        price: data.durationPrices?.[time],
        time: time,
        date: date,
        duration: numberDays,
        ownerID: data.userId

      };

      localStorage.setItem("productDetail", JSON.stringify(productDetail));
      navigate("/checkout");
    } catch (error) {
      // Handle any errors here
      console.error(error);
    }
  }

  const calculateDay = (e) => {
    e.preventDefault();
    try {
      const formattedData = date.map((item) => ({
        date: {
          startDate: formatDateToDDMMYYYY(item.startDate),
          endDate: formatDateToDDMMYYYY(item.endDate),
        },
      }));

      const startDateString = formattedData[0].date.startDate;
      const endDateString = formattedData[0].date.endDate;

      const startDateParts = startDateString.split("/");
      const endDateParts = endDateString.split("/");

      const NumberOfDays = ((endDateParts[0] - startDateParts[0]) + 1);
      console.log(NumberOfDays);
      setNumberDays(NumberOfDays);
      setOpenDate(!openDate);

    } catch (error) {
      console.log("The Error is", error);

    }



  }
  const handleSingleDayClick = (e) => {
    e.preventDefault();
    setSingleDay(true);
    setMultiDay(false);
  };

  const handleMultiDayClick = (e) => {
    e.preventDefault();
    setSingleDay(false);
    setMultiDay(true);
  };



  return (
    <>
      <Navbar />
      <div className="singleProductSlider">
        <Slider {...settings}>
          {Array.isArray(data.images) && data.images.length > 0 ? (
            data.images.map((image, imageIndex) => (
              <div key={imageIndex} className="singleProductSlider-content">
                <img src={`https://theyachtbuddy.com/uploads/${image.filename}`} alt="" />
              </div>
            ))
          ) : (
            <p>No images to display</p>
          )}
        </Slider>

      </div>

      <div className="wrapper">
        <div className="singleBoatInfo">
          <div className="singleBoatInfoL">
            <h1>Lake Pleasant enjoy a new 2023 Yamaha SX190 Jetboat</h1>
            <div className="glibert">
              <span>
                <img src={star} alt=""></img>
                <img src={star} alt=""></img>
                <img src={star} alt=""></img>
                <img src={star} alt=""></img>
                <img src={star} alt=""></img>
                <label>5.0</label>
                <p>(4 bookings)</p>
              </span>
              <div className="lineDivide"></div>
              <p>Gilbert, AZ</p>
            </div>

            <div className="sc-31598d9d-0 sc-617d572c-0 sc-f5ff59e2-9 kbnFZE goeXEm dghmTt">
              <div className="sc-f5ff59e2-8 kKtNiv">
                <div className="sc-f5ff59e2-2 dKIhhx">
                  <svg
                    width={21}
                    height={16}
                    viewBox="0 0 21 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask id="path-1-inside-1_963_25214" fill="white">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M19.5484 8.47395C19.7384 8.27964 19.7384 7.96918 19.5484 7.77487L14.3379 2.44541C14.0246 2.12494 13.4804 2.34677 13.4804 2.79495V5.60095H7.39605V2.79551C7.39605 2.34733 6.85184 2.1255 6.53853 2.44597L1.32803 7.77543C1.13805 7.96974 1.13805 8.2802 1.32803 8.47451L6.53853 13.804C6.85184 14.1244 7.39605 13.9026 7.39605 13.4544V10.6478H13.4804V13.4539C13.4804 13.9021 14.0246 14.1239 14.3379 13.8034L19.5484 8.47395Z"
                      />
                    </mask>
                    <path
                      d="M19.5484 7.77487L20.2634 7.07579V7.07579L19.5484 7.77487ZM19.5484 8.47395L18.8334 7.77487L18.8334 7.77487L19.5484 8.47395ZM14.3379 2.44541L15.0529 1.74633L15.0529 1.74633L14.3379 2.44541ZM13.4804 5.60095V6.60095H14.4804V5.60095H13.4804ZM7.39605 5.60095H6.39605V6.60095H7.39605V5.60095ZM6.53853 2.44597L5.82349 1.74689V1.74689L6.53853 2.44597ZM1.32803 7.77543L0.612984 7.07635L1.32803 7.77543ZM1.32803 8.47451L0.612985 9.1736H0.612985L1.32803 8.47451ZM6.53853 13.804L7.25357 13.1049H7.25357L6.53853 13.804ZM7.39605 10.6478V9.64784H6.39605V10.6478H7.39605ZM13.4804 10.6478H14.4804V9.64784H13.4804V10.6478ZM14.3379 13.8034L15.0529 14.5025L15.0529 14.5025L14.3379 13.8034ZM18.8334 8.47395C18.6434 8.27965 18.6434 7.96918 18.8334 7.77487L20.2634 9.17304C20.8334 8.5901 20.8333 7.65871 20.2634 7.07579L18.8334 8.47395ZM13.6228 3.14449L18.8334 8.47395L20.2634 7.07579L15.0529 1.74633L13.6228 3.14449ZM14.4804 2.79495C14.4804 3.24314 13.9362 3.46495 13.6228 3.14449L15.0529 1.74633C14.113 0.784935 12.4804 1.45041 12.4804 2.79495H14.4804ZM14.4804 5.60095V2.79495H12.4804V5.60095H14.4804ZM13.4804 4.60095H7.39605V6.60095H13.4804V4.60095ZM8.39605 5.60095V2.79551H6.39605V5.60095H8.39605ZM8.39605 2.79551C8.39605 1.45097 6.76342 0.785495 5.82349 1.74689L7.25357 3.14505C6.94026 3.46551 6.39605 3.2437 6.39605 2.79551H8.39605ZM5.82349 1.74689L0.612984 7.07635L2.04307 8.47451L7.25357 3.14505L5.82349 1.74689ZM0.612984 7.07635C0.0430659 7.65928 0.0430696 8.59067 0.612985 9.1736L2.04307 7.77543C2.23304 7.96974 2.23304 8.2802 2.04307 8.47451L0.612984 7.07635ZM0.612985 9.1736L5.82349 14.5031L7.25357 13.1049L2.04307 7.77543L0.612985 9.1736ZM5.82349 14.5031C6.76342 15.4644 8.39605 14.799 8.39605 13.4544H6.39605C6.39605 13.0062 6.94027 12.7844 7.25357 13.1049L5.82349 14.5031ZM8.39605 13.4544V10.6478H6.39605V13.4544H8.39605ZM7.39605 11.6478H13.4804V9.64784H7.39605V11.6478ZM14.4804 13.4539V10.6478H12.4804V13.4539H14.4804ZM13.6228 13.1043C13.9362 12.7839 14.4804 13.0057 14.4804 13.4539H12.4804C12.4804 14.7984 14.113 15.4639 15.0529 14.5025L13.6228 13.1043ZM18.8334 7.77487L13.6228 13.1043L15.0529 14.5025L20.2634 9.17303L18.8334 7.77487Z"
                      fill="#17233C"
                      mask="url(#path-1-inside-1_963_25214)"
                    />
                    <line
                      x1="0.5"
                      y1="0.5"
                      x2="0.499999"
                      y2="15.5"
                      stroke="#17233C"
                      strokeLinecap="round"
                    />
                    <line
                      x1="20.1914"
                      y1="0.5"
                      x2="20.1914"
                      y2="15.5"
                      stroke="#17233C"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="sc-f5ff59e2-3 ivabpn">19 ft</div>
                <div className="sc-f5ff59e2-4 dnJmhQ">Boat length</div>
              </div>
              <div className="sc-f5ff59e2-8 kKtNiv">
                <div className="sc-f5ff59e2-2 dKIhhx">
                  <svg
                    width={12}
                    height={16}
                    viewBox="0 0 12 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.87633 15.8183C4.15596 15.8183 2.49358 15.4002 1.06315 14.603C0.657222 14.3794 0.347941 13.9905 0.222296 13.553C0.0773202 13.0086 0 12.4641 0 11.9197C0 9.22667 1.72037 6.43642 4.01099 5.44476C4.37826 5.27948 4.80352 5.45448 4.96782 5.82392C5.12246 6.19336 4.94849 6.62114 4.58122 6.77669C2.82219 7.54474 1.44975 9.80028 1.44975 11.9197C1.44975 12.3378 1.50774 12.7461 1.62372 13.1544C1.64305 13.2225 1.69138 13.2808 1.7687 13.3197C4.20429 14.6711 7.55805 14.6711 9.99364 13.3197C10.0613 13.2808 10.1193 13.2128 10.1386 13.1544C10.2546 12.7461 10.3126 12.328 10.3126 11.9197C10.3126 9.80028 8.94015 7.54474 7.18111 6.77669C6.80418 6.62114 6.63987 6.19337 6.79451 5.8142C6.94915 5.44476 7.37441 5.26976 7.75135 5.43504C10.0323 6.4267 11.7623 9.21695 11.7623 11.91C11.7623 12.4544 11.685 13.0086 11.54 13.5433C11.4144 13.9808 11.1148 14.3697 10.6992 14.5933C9.25909 15.3905 7.59671 15.8183 5.87633 15.8183Z"
                      fill="#17233C"
                    />
                    <path
                      d="M5.87579 7.15562C3.95245 7.15562 2.38672 5.58063 2.38672 3.64592C2.38672 1.71122 3.95245 0.13623 5.87579 0.13623C7.79913 0.13623 9.36487 1.71122 9.36487 3.64592C9.36487 5.58063 7.79913 7.15562 5.87579 7.15562ZM5.87579 1.59455C4.75465 1.59455 3.83647 2.51816 3.83647 3.64592C3.83647 4.77369 4.75465 5.6973 5.87579 5.6973C6.99693 5.6973 7.91511 4.77369 7.91511 3.64592C7.91511 2.51816 7.0066 1.59455 5.87579 1.59455Z"
                      fill="#17233C"
                    />
                  </svg>
                </div>
                <div className="sc-f5ff59e2-3 ivabpn">Up to 8</div>
                <div className="sc-f5ff59e2-4 dnJmhQ">Passengers</div>
              </div>
              <div className="sc-f5ff59e2-8 kKtNiv">
                <div className="sc-f5ff59e2-2 dKIhhx">
                  <svg
                    width={19}
                    height={17}
                    viewBox="0 0 19 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.233 5.47796C16.1408 2.5721 12.8862 0.944824 9.51545 0.944824C6.02842 0.944824 2.89009 2.5721 0.797875 5.47796C0.681641 5.71043 0.681641 5.9429 0.681641 6.17537L1.84398 9.89486C1.96022 10.3598 2.30892 10.8247 2.54139 11.0572C2.54139 11.4059 2.42515 11.6384 2.42515 11.9871C2.42515 14.3118 6.14465 16.0553 9.51545 16.0553C12.8862 16.0553 16.6057 14.428 16.6057 11.9871C16.6057 11.6384 16.4895 11.2897 16.3733 11.0572C16.722 10.7085 16.9544 10.3598 17.0707 9.89486L18.233 6.17537C18.3493 5.9429 18.3493 5.71043 18.233 5.47796ZM15.2109 11.9871C15.2109 13.1494 12.5375 14.6605 9.39921 14.6605C6.37712 14.6605 3.5875 13.1494 3.5875 11.9871C3.5875 11.8708 3.5875 11.7546 3.70373 11.6384C3.81997 11.6384 3.9362 11.6384 4.05243 11.6384H14.6298C14.746 11.6384 14.8622 11.6384 14.9785 11.6384C15.2109 11.7546 15.2109 11.8708 15.2109 11.9871ZM14.746 10.3598H4.16867C3.70373 10.3598 3.23879 10.0111 3.12256 9.42993L2.07645 6.05913C3.9362 3.73445 6.60959 2.33964 9.51545 2.33964C12.4213 2.33964 15.0947 3.73445 16.9544 6.05913L15.9083 9.42993C15.6759 10.0111 15.3272 10.3598 14.746 10.3598ZM8.23687 6.2916C8.23687 5.5942 8.81804 5.01302 9.51545 5.01302C10.2129 5.01302 10.794 5.5942 10.794 6.2916C10.794 6.98901 10.2129 7.57018 9.51545 7.57018C8.81804 7.57018 8.23687 6.98901 8.23687 6.2916Z"
                      fill="#17233C"
                    />
                  </svg>
                </div>
                <div className="sc-f5ff59e2-3 ivabpn">No captain</div>
                <div className="sc-f5ff59e2-4 dnJmhQ">
                  The renter can operate the boat
                </div>
              </div>
              <div className="sc-f5ff59e2-8 kKtNiv">
                <div className="sc-f5ff59e2-2 dKIhhx">
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.891 0.783691H3.10801C1.60158 0.783691 0.380859 2.00444 0.380859 3.51086V9.52788C0.380859 11.0343 1.60158 12.255 3.10801 12.255H4.07766V16.5665C4.07766 16.8263 4.23349 17.0687 4.47591 17.1639C4.55383 17.1985 4.6404 17.2158 4.72698 17.2158C4.89147 17.2158 5.06463 17.1466 5.18583 17.0254L9.95617 12.255H14.891C16.3974 12.255 17.6182 11.0343 17.6182 9.52788V3.51086C17.6182 2.00444 16.3888 0.783691 14.891 0.783691ZM16.3195 9.52788C16.3195 10.3157 15.6789 10.9564 14.891 10.9564H9.68779C9.51464 10.9564 9.35014 11.0256 9.22894 11.1469L5.3763 14.9995V11.6057C5.3763 11.2507 5.08194 10.9564 4.72698 10.9564H3.10801C2.32016 10.9564 1.6795 10.3157 1.6795 9.52788V3.51086C1.6795 2.72302 2.32016 2.08233 3.10801 2.08233H14.891C15.6789 2.08233 16.3195 2.72302 16.3195 3.51086V9.52788ZM6.12951 6.51505C6.12951 7.19034 5.57542 7.74442 4.90013 7.74442C4.22484 7.74442 3.67075 7.19034 3.67075 6.51505C3.67075 5.83976 4.22484 5.28566 4.90013 5.28566C5.57542 5.28566 6.12951 5.83976 6.12951 6.51505ZM10.2246 6.51505C10.2246 7.19034 9.67047 7.74442 8.99518 7.74442C8.31989 7.74442 7.7658 7.19034 7.7658 6.51505C7.7658 5.83976 8.31989 5.28566 8.99518 5.28566C9.67047 5.28566 10.2246 5.83976 10.2246 6.51505ZM14.3283 6.51505C14.3283 7.19034 13.7742 7.74442 13.0989 7.74442C12.4236 7.74442 11.8695 7.19034 11.8695 6.51505C11.8695 5.83976 12.4236 5.28566 13.0989 5.28566C13.7742 5.28566 14.3283 5.83976 14.3283 6.51505Z"
                      fill="#17233C"
                    />
                  </svg>
                </div>
                <div className="sc-f5ff59e2-3 ivabpn">84%</div>
                <div className="sc-f5ff59e2-4 dnJmhQ">
                  Owner’s response rate
                </div>
              </div>
            </div>
            <div
              id="boatInfo"
              className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-19 sc-1c3fc0c7-0 kbnFZE goeXEm fJYdpT idtAGw"
            >
              <div className="sc-31598d9d-0 sc-617d572c-17 kbnFZE cJ  jwwp">
                <h2 className="sc-3eb0d354-1 cGikrv">The boat</h2>
                <div className="sc-1c3fc0c7-1 gqfTeg">
                  <p>
                    *now with new installed monster wake tower* Enjoy this brand
                    new Yamaha SX190 boat for a day on the lake!! Delivery is
                    available to Lake Pleasant only for a fee of 150.00 This can
                    hold up to 8 people comfortably. We supply all the toys you
                    want. You can ride in the Big Mable 2 Person Tube or even
                    attempt to wakesurf, this boat will do it all. If you are
                    not into action sports enjoy a leisurely ride or even fish
                    off the back with ease (I do not supply fishing equipment)
                    Also features a Bimini top to stay in the shade and a 4
                    speaker stereo with Bluetooth or USB support. Includes all
                    life vests just message me with sizes so I can have them
                    onboard and ready. There is a small table included that can
                    be attached onboard so you can eat and drink comfortably.
                    Also has all required safety items onboard.*no pets allowed
                    no drinks that can stain (red colored drinks)*
                  </p>
                  <br />
                  <br />
                  <div className="sc-1c3fc0c7-2 cguaRW" />
                </div>
                <div></div>
              </div>
              <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 sc-11cea843-1 sc-11cea843-11 kbnFZE goeXEm jpkWIi iGOGGr iILcgg">
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-11cea843-2 kbnFZE goeXEm eaNXo dWOPDy">
                  <img
                    alt="Ryan"
                    src="https://s3.amazonaws.com/boatsetter-prod/users/profile_images/001/044/169/square_50/17BE9D18-B8A9-49B3-8311-1999C023636D.jpg?1692475772"
                    className="sc-11cea843-3 eNKVtd"
                  />
                </div>
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 sc-617d572c-8 sc-617d572c-21 kbnFZE goeXEm jpkWIi jcqVaj dQZTiY">
                  <div className="sc-11cea843-8 dCbojR">Owned by</div>
                  <div
                    fontSize="14px"
                    className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-11cea843-4 kbnFZE goeXEm eaNXo kzXcfV"
                  >
                    Ryan
                  </div>
                  <div>
                    <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 kbnFZE fvhGND eaNXo">
                      <svg
                        width={16}
                        height={16}
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <linearGradient
                            id="grad100"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop
                              offset="100%"
                              style={{ stopColor: "#72D4BA", stopOpacity: 1 }}
                            />
                            <stop
                              offset="100%"
                              style={{ stopColor: "#DBDFE5", stopOpacity: 1 }}
                            />
                          </linearGradient>
                        </defs>
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                          fill="url(#grad100)"
                        />
                      </svg>
                      <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-35c925f6-0 kbnFZE goeXEm eaNXo bNZysC">
                        <div className="sc-35c925f6-1 gHCpEH">5.0</div>
                        <div className="sc-35c925f6-2 fJiFNs">
                          ({/* */}3{/* */} ratings{/* */})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sc-3eb0d354-0 idKRxe">
              <h2 className="sc-3eb0d354-1 cGikrv">Amenities</h2>
              <div className="goeXEm1">
                <div className="goeXEm goeXEm2">
                  <svg
                    className=""
                    width={19}
                    height={19}
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.49999 0.96875C4.79281 0.96875 0.96875 4.80134 0.96875 9.49995C0.96875 14.2071 4.80138 18.0312 9.49999 18.0312C14.2072 18.0312 18.0312 14.1986 18.0312 9.49995C18.0398 4.79276 14.2072 0.96875 9.49999 0.96875ZM9.49999 16.7451C5.50446 16.7451 2.25487 13.4955 2.25487 9.49995C2.25487 5.50441 5.50446 2.25487 9.49999 2.25487C13.4955 2.25487 16.7451 5.50441 16.7451 9.49995C16.7537 13.4955 13.4955 16.7451 9.49999 16.7451ZM13.4441 6.76481C13.6927 7.02203 13.6842 7.42501 13.4355 7.67366L8.74547 12.2437C8.61686 12.3637 8.46253 12.4238 8.29962 12.4238C8.13671 12.4238 7.9738 12.3637 7.84519 12.2437L5.58162 10.0144C5.3244 9.76578 5.3244 9.35422 5.57305 9.10558C5.8217 8.85693 6.23326 8.84834 6.4819 9.09699L8.29962 10.8804L12.5438 6.74769C12.7839 6.50762 13.1954 6.50758 13.4441 6.76481Z"
                      fill="#17233C"
                    />
                  </svg>
                  <span>Stereo</span>
                </div>
                <div className="goeXEm goeXEm2">
                  <svg
                    className=""
                    width={19}
                    height={19}
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.49999 0.96875C4.79281 0.96875 0.96875 4.80134 0.96875 9.49995C0.96875 14.2071 4.80138 18.0312 9.49999 18.0312C14.2072 18.0312 18.0312 14.1986 18.0312 9.49995C18.0398 4.79276 14.2072 0.96875 9.49999 0.96875ZM9.49999 16.7451C5.50446 16.7451 2.25487 13.4955 2.25487 9.49995C2.25487 5.50441 5.50446 2.25487 9.49999 2.25487C13.4955 2.25487 16.7451 5.50441 16.7451 9.49995C16.7537 13.4955 13.4955 16.7451 9.49999 16.7451ZM13.4441 6.76481C13.6927 7.02203 13.6842 7.42501 13.4355 7.67366L8.74547 12.2437C8.61686 12.3637 8.46253 12.4238 8.29962 12.4238C8.13671 12.4238 7.9738 12.3637 7.84519 12.2437L5.58162 10.0144C5.3244 9.76578 5.3244 9.35422 5.57305 9.10558C5.8217 8.85693 6.23326 8.84834 6.4819 9.09699L8.29962 10.8804L12.5438 6.74769C12.7839 6.50762 13.1954 6.50758 13.4441 6.76481Z"
                      fill="#17233C"
                    />
                  </svg>
                  <span>Stereo Aux Input</span>
                </div>
                <div className="goeXEm goeXEm2">
                  <svg
                    className=""
                    width={19}
                    height={19}
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.49999 0.96875C4.79281 0.96875 0.96875 4.80134 0.96875 9.49995C0.96875 14.2071 4.80138 18.0312 9.49999 18.0312C14.2072 18.0312 18.0312 14.1986 18.0312 9.49995C18.0398 4.79276 14.2072 0.96875 9.49999 0.96875ZM9.49999 16.7451C5.50446 16.7451 2.25487 13.4955 2.25487 9.49995C2.25487 5.50441 5.50446 2.25487 9.49999 2.25487C13.4955 2.25487 16.7451 5.50441 16.7451 9.49995C16.7537 13.4955 13.4955 16.7451 9.49999 16.7451ZM13.4441 6.76481C13.6927 7.02203 13.6842 7.42501 13.4355 7.67366L8.74547 12.2437C8.61686 12.3637 8.46253 12.4238 8.29962 12.4238C8.13671 12.4238 7.9738 12.3637 7.84519 12.2437L5.58162 10.0144C5.3244 9.76578 5.3244 9.35422 5.57305 9.10558C5.8217 8.85693 6.23326 8.84834 6.4819 9.09699L8.29962 10.8804L12.5438 6.74769C12.7839 6.50762 13.1954 6.50758 13.4441 6.76481Z"
                      fill="#17233C"
                    />
                  </svg>
                  <span>Bluetooth audio</span>
                </div>
                <div className="goeXEm goeXEm2">
                  <svg
                    className=""
                    width={19}
                    height={19}
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.49999 0.96875C4.79281 0.96875 0.96875 4.80134 0.96875 9.49995C0.96875 14.2071 4.80138 18.0312 9.49999 18.0312C14.2072 18.0312 18.0312 14.1986 18.0312 9.49995C18.0398 4.79276 14.2072 0.96875 9.49999 0.96875ZM9.49999 16.7451C5.50446 16.7451 2.25487 13.4955 2.25487 9.49995C2.25487 5.50441 5.50446 2.25487 9.49999 2.25487C13.4955 2.25487 16.7451 5.50441 16.7451 9.49995C16.7537 13.4955 13.4955 16.7451 9.49999 16.7451ZM13.4441 6.76481C13.6927 7.02203 13.6842 7.42501 13.4355 7.67366L8.74547 12.2437C8.61686 12.3637 8.46253 12.4238 8.29962 12.4238C8.13671 12.4238 7.9738 12.3637 7.84519 12.2437L5.58162 10.0144C5.3244 9.76578 5.3244 9.35422 5.57305 9.10558C5.8217 8.85693 6.23326 8.84834 6.4819 9.09699L8.29962 10.8804L12.5438 6.74769C12.7839 6.50762 13.1954 6.50758 13.4441 6.76481Z"
                      fill="#17233C"
                    />
                  </svg>
                  <span>Inflatable toys</span>
                </div>
                <div className="goeXEm goeXEm2">
                  <svg
                    className=""
                    width={19}
                    height={19}
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.49999 0.96875C4.79281 0.96875 0.96875 4.80134 0.96875 9.49995C0.96875 14.2071 4.80138 18.0312 9.49999 18.0312C14.2072 18.0312 18.0312 14.1986 18.0312 9.49995C18.0398 4.79276 14.2072 0.96875 9.49999 0.96875ZM9.49999 16.7451C5.50446 16.7451 2.25487 13.4955 2.25487 9.49995C2.25487 5.50441 5.50446 2.25487 9.49999 2.25487C13.4955 2.25487 16.7451 5.50441 16.7451 9.49995C16.7537 13.4955 13.4955 16.7451 9.49999 16.7451ZM13.4441 6.76481C13.6927 7.02203 13.6842 7.42501 13.4355 7.67366L8.74547 12.2437C8.61686 12.3637 8.46253 12.4238 8.29962 12.4238C8.13671 12.4238 7.9738 12.3637 7.84519 12.2437L5.58162 10.0144C5.3244 9.76578 5.3244 9.35422 5.57305 9.10558C5.8217 8.85693 6.23326 8.84834 6.4819 9.09699L8.29962 10.8804L12.5438 6.74769C12.7839 6.50762 13.1954 6.50758 13.4441 6.76481Z"
                      fill="#17233C"
                    />
                  </svg>
                  <span>Cooler / Ice chest</span>
                </div>
                <div className="goeXEm goeXEm2">
                  <svg
                    className=""
                    width={19}
                    height={19}
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.49999 0.96875C4.79281 0.96875 0.96875 4.80134 0.96875 9.49995C0.96875 14.2071 4.80138 18.0312 9.49999 18.0312C14.2072 18.0312 18.0312 14.1986 18.0312 9.49995C18.0398 4.79276 14.2072 0.96875 9.49999 0.96875ZM9.49999 16.7451C5.50446 16.7451 2.25487 13.4955 2.25487 9.49995C2.25487 5.50441 5.50446 2.25487 9.49999 2.25487C13.4955 2.25487 16.7451 5.50441 16.7451 9.49995C16.7537 13.4955 13.4955 16.7451 9.49999 16.7451ZM13.4441 6.76481C13.6927 7.02203 13.6842 7.42501 13.4355 7.67366L8.74547 12.2437C8.61686 12.3637 8.46253 12.4238 8.29962 12.4238C8.13671 12.4238 7.9738 12.3637 7.84519 12.2437L5.58162 10.0144C5.3244 9.76578 5.3244 9.35422 5.57305 9.10558C5.8217 8.85693 6.23326 8.84834 6.4819 9.09699L8.29962 10.8804L12.5438 6.74769C12.7839 6.50762 13.1954 6.50758 13.4441 6.76481Z"
                      fill="#17233C"
                    />
                  </svg>
                  <span>Swim ladder</span>
                </div>
                <div className="goeXEm goeXEm2">
                  <svg
                    className=""
                    width={19}
                    height={19}
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.49999 0.96875C4.79281 0.96875 0.96875 4.80134 0.96875 9.49995C0.96875 14.2071 4.80138 18.0312 9.49999 18.0312C14.2072 18.0312 18.0312 14.1986 18.0312 9.49995C18.0398 4.79276 14.2072 0.96875 9.49999 0.96875ZM9.49999 16.7451C5.50446 16.7451 2.25487 13.4955 2.25487 9.49995C2.25487 5.50441 5.50446 2.25487 9.49999 2.25487C13.4955 2.25487 16.7451 5.50441 16.7451 9.49995C16.7537 13.4955 13.4955 16.7451 9.49999 16.7451ZM13.4441 6.76481C13.6927 7.02203 13.6842 7.42501 13.4355 7.67366L8.74547 12.2437C8.61686 12.3637 8.46253 12.4238 8.29962 12.4238C8.13671 12.4238 7.9738 12.3637 7.84519 12.2437L5.58162 10.0144C5.3244 9.76578 5.3244 9.35422 5.57305 9.10558C5.8217 8.85693 6.23326 8.84834 6.4819 9.09699L8.29962 10.8804L12.5438 6.74769C12.7839 6.50762 13.1954 6.50758 13.4441 6.76481Z"
                      fill="#17233C"
                    />
                  </svg>
                  <span>Children's life jackets</span>
                </div>
                <div className="goeXEm goeXEm2">
                  <svg
                    className=""
                    width={19}
                    height={19}
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.49999 0.96875C4.79281 0.96875 0.96875 4.80134 0.96875 9.49995C0.96875 14.2071 4.80138 18.0312 9.49999 18.0312C14.2072 18.0312 18.0312 14.1986 18.0312 9.49995C18.0398 4.79276 14.2072 0.96875 9.49999 0.96875ZM9.49999 16.7451C5.50446 16.7451 2.25487 13.4955 2.25487 9.49995C2.25487 5.50441 5.50446 2.25487 9.49999 2.25487C13.4955 2.25487 16.7451 5.50441 16.7451 9.49995C16.7537 13.4955 13.4955 16.7451 9.49999 16.7451ZM13.4441 6.76481C13.6927 7.02203 13.6842 7.42501 13.4355 7.67366L8.74547 12.2437C8.61686 12.3637 8.46253 12.4238 8.29962 12.4238C8.13671 12.4238 7.9738 12.3637 7.84519 12.2437L5.58162 10.0144C5.3244 9.76578 5.3244 9.35422 5.57305 9.10558C5.8217 8.85693 6.23326 8.84834 6.4819 9.09699L8.29962 10.8804L12.5438 6.74769C12.7839 6.50762 13.1954 6.50758 13.4441 6.76481Z"
                      fill="#17233C"
                    />
                  </svg>
                  <span>Wakeboard</span>
                </div>
                <div className="goeXEm goeXEm2">
                  <svg
                    className=""
                    width={19}
                    height={19}
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.49999 0.96875C4.79281 0.96875 0.96875 4.80134 0.96875 9.49995C0.96875 14.2071 4.80138 18.0312 9.49999 18.0312C14.2072 18.0312 18.0312 14.1986 18.0312 9.49995C18.0398 4.79276 14.2072 0.96875 9.49999 0.96875ZM9.49999 16.7451C5.50446 16.7451 2.25487 13.4955 2.25487 9.49995C2.25487 5.50441 5.50446 2.25487 9.49999 2.25487C13.4955 2.25487 16.7451 5.50441 16.7451 9.49995C16.7537 13.4955 13.4955 16.7451 9.49999 16.7451ZM13.4441 6.76481C13.6927 7.02203 13.6842 7.42501 13.4355 7.67366L8.74547 12.2437C8.61686 12.3637 8.46253 12.4238 8.29962 12.4238C8.13671 12.4238 7.9738 12.3637 7.84519 12.2437L5.58162 10.0144C5.3244 9.76578 5.3244 9.35422 5.57305 9.10558C5.8217 8.85693 6.23326 8.84834 6.4819 9.09699L8.29962 10.8804L12.5438 6.74769C12.7839 6.50762 13.1954 6.50758 13.4441 6.76481Z"
                      fill="#17233C"
                    />
                  </svg>
                  <span>Anchor</span>
                </div>
                <div className="goeXEm goeXEm2">
                  <svg
                    className=""
                    width={19}
                    height={19}
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.49999 0.96875C4.79281 0.96875 0.96875 4.80134 0.96875 9.49995C0.96875 14.2071 4.80138 18.0312 9.49999 18.0312C14.2072 18.0312 18.0312 14.1986 18.0312 9.49995C18.0398 4.79276 14.2072 0.96875 9.49999 0.96875ZM9.49999 16.7451C5.50446 16.7451 2.25487 13.4955 2.25487 9.49995C2.25487 5.50441 5.50446 2.25487 9.49999 2.25487C13.4955 2.25487 16.7451 5.50441 16.7451 9.49995C16.7537 13.4955 13.4955 16.7451 9.49999 16.7451ZM13.4441 6.76481C13.6927 7.02203 13.6842 7.42501 13.4355 7.67366L8.74547 12.2437C8.61686 12.3637 8.46253 12.4238 8.29962 12.4238C8.13671 12.4238 7.9738 12.3637 7.84519 12.2437L5.58162 10.0144C5.3244 9.76578 5.3244 9.35422 5.57305 9.10558C5.8217 8.85693 6.23326 8.84834 6.4819 9.09699L8.29962 10.8804L12.5438 6.74769C12.7839 6.50762 13.1954 6.50758 13.4441 6.76481Z"
                      fill="#17233C"
                    />
                  </svg>
                  <span>Depth finder</span>
                </div>
              </div>
            </div>

            <div className="sc-3eb0d354-0 idKRxe">
              <h2 className="sc-3eb0d354-1 cGikrv">Specifications</h2>
              <div className="sc-21224b6b-0 dnLjIw">
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-21224b6b-1 kbnFZE goeXEm bZmyIo">
                  <div>
                    <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-21224b6b-2 kbnFZE goeXEm eaNXo fxHftj">
                      <svg
                        width={17}
                        height={17}
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.9624 3.7653H12.4505V1.37806C12.4505 1.0518 12.1869 0.78125 11.869 0.78125C11.5511 0.78125 11.2874 1.0518 11.2874 1.37806V3.7653H4.92169V1.37806C4.92169 1.0518 4.65807 0.78125 4.34017 0.78125C4.02227 0.78125 3.75865 1.0518 3.75865 1.37806V3.7653H3.03756C1.79698 3.7653 0.78125 4.80774 0.78125 6.08093V13.9031C0.78125 15.1763 1.79698 16.2188 3.03756 16.2188H13.9624C15.203 16.2188 16.2188 15.1763 16.2188 13.9031V6.08093C16.2188 4.79978 15.203 3.7653 13.9624 3.7653ZM15.0557 13.8952C15.0557 14.5159 14.5672 15.0172 13.9624 15.0172H3.03756C2.43278 15.0172 1.9443 14.5159 1.9443 13.8952V6.07297C1.9443 5.45228 2.43278 4.95097 3.03756 4.95097H13.9624C14.5672 4.95097 15.0557 5.45228 15.0557 6.07297V13.8952ZM12.8304 6.47084H4.16959C3.85169 6.47084 3.58807 6.7414 3.58807 7.06765V12.9005C3.58807 13.2268 3.85169 13.4973 4.16959 13.4973H12.8304C13.1483 13.4973 13.4119 13.2268 13.4119 12.9005V7.06765C13.4119 6.7414 13.1483 6.47084 12.8304 6.47084ZM12.2489 12.3037H4.75111V7.66446H12.2489V12.3037Z"
                          fill="#17233C"
                        />
                      </svg>
                      <span>Year</span>
                    </div>
                  </div>
                  <div className="sc-21224b6b-3 hZyEQd">2023</div>
                </div>
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-21224b6b-1 kbnFZE goeXEm bZmyIo">
                  <div>
                    <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-21224b6b-2 kbnFZE goeXEm eaNXo fxHftj">
                      <svg
                        width={17}
                        height={13}
                        viewBox="0 0 17 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <mask id="path-1-inside-1_963_25253" fill="white">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.8184 6.95074C16.0084 6.75643 16.0084 6.44596 15.8184 6.25166L11.8097 2.15146C11.4964 1.831 10.9522 2.05283 10.9522 2.501V4.55103H6.00867V2.50131C6.00867 2.05314 5.46447 1.83131 5.15115 2.15177L1.14248 6.25197C0.952507 6.44627 0.952507 6.75674 1.14248 6.95105L5.15115 11.0512C5.46447 11.3717 6.00867 11.1499 6.00867 10.7017V8.65162H10.9522V10.7014C10.9522 11.1496 11.4964 11.3714 11.8097 11.0509L15.8184 6.95074Z"
                          />
                        </mask>
                        <path
                          d="M15.8184 6.25166L16.5335 5.55257V5.55257L15.8184 6.25166ZM15.8184 6.95074L16.5335 7.64982V7.64982L15.8184 6.95074ZM11.8097 2.15146L12.5248 1.45238L12.5248 1.45238L11.8097 2.15146ZM10.9522 4.55103V5.55103H11.9522V4.55103H10.9522ZM6.00867 4.55103H5.00867V5.55103H6.00867V4.55103ZM5.15115 2.15177L5.86619 2.85085L5.8662 2.85085L5.15115 2.15177ZM1.14248 6.25197L0.427437 5.55288H0.427437L1.14248 6.25197ZM1.14248 6.95105L0.427437 7.65013H0.427437L1.14248 6.95105ZM5.15115 11.0512L4.43611 11.7503L4.43611 11.7503L5.15115 11.0512ZM6.00867 8.65162V7.65162H5.00867V8.65162H6.00867ZM10.9522 8.65162H11.9522V7.65162H10.9522V8.65162ZM11.8097 11.0509L12.5248 11.75L12.5248 11.75L11.8097 11.0509ZM15.1034 6.95074C14.9134 6.75643 14.9134 6.44597 15.1034 6.25166L16.5335 7.64982C17.1034 7.06689 17.1034 6.1355 16.5335 5.55257L15.1034 6.95074ZM11.0947 2.85055L15.1034 6.95074L16.5335 5.55257L12.5248 1.45238L11.0947 2.85055ZM11.9522 2.501C11.9522 2.94918 11.408 3.17101 11.0947 2.85055L12.5248 1.45238C11.5848 0.490983 9.95222 1.15647 9.95222 2.501H11.9522ZM11.9522 4.55103V2.501H9.95222V4.55103H11.9522ZM10.9522 3.55103H6.00867V5.55103H10.9522V3.55103ZM7.00867 4.55103V2.50131H5.00867V4.55103H7.00867ZM7.00867 2.50131C7.00867 1.15678 5.37605 0.491292 4.43611 1.45269L5.8662 2.85085C5.55288 3.17132 5.00867 2.94949 5.00867 2.50131H7.00867ZM4.43611 1.45269L0.427437 5.55288L1.85752 6.95105L5.86619 2.85085L4.43611 1.45269ZM0.427437 5.55288C-0.142479 6.13581 -0.142479 7.0672 0.427437 7.65013L1.85752 6.25197C2.04749 6.44627 2.04749 6.75674 1.85752 6.95105L0.427437 5.55288ZM0.427437 7.65013L4.43611 11.7503L5.86619 10.3522L1.85752 6.25197L0.427437 7.65013ZM4.43611 11.7503C5.37605 12.7117 7.00867 12.0462 7.00867 10.7017H5.00867C5.00867 10.2535 5.55288 10.0317 5.86619 10.3522L4.43611 11.7503ZM7.00867 10.7017V8.65162H5.00867V10.7017H7.00867ZM6.00867 9.65162H10.9522V7.65162H6.00867V9.65162ZM11.9522 10.7014V8.65162H9.95222V10.7014H11.9522ZM11.0947 10.3518C11.408 10.0314 11.9522 10.2532 11.9522 10.7014H9.95222C9.95222 12.0459 11.5848 12.7114 12.5248 11.75L11.0947 10.3518ZM15.1034 6.25166L11.0947 10.3518L12.5248 11.75L16.5335 7.64982L15.1034 6.25166Z"
                          fill="#17233C"
                          mask="url(#path-1-inside-1_963_25253)"
                        />
                        <line
                          x1="0.5"
                          y1="0.5"
                          x2="0.5"
                          y2="12.5"
                          stroke="#17233C"
                          strokeLinecap="round"
                        />
                        <line
                          x1="16.5"
                          y1="0.5"
                          x2="16.5"
                          y2="12.5"
                          stroke="#17233C"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Length</span>
                    </div>
                  </div>
                  <div className="sc-21224b6b-3 hZyEQd">19 ft.</div>
                </div>
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-21224b6b-1 kbnFZE goeXEm bZmyIo">
                  <div>
                    <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-21224b6b-2 kbnFZE goeXEm eaNXo fxHftj">
                      <svg
                        width={13}
                        height={15}
                        viewBox="0 0 13 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.5 0.5H11.6538V9.68944L6.07692 13.7454L0.5 9.68944V0.5Z"
                          stroke="#17233C"
                        />
                        <path
                          d="M6.0005 4.54132C5.30965 4.54132 4.74805 3.97156 4.74805 3.27066C4.74805 2.56976 5.30965 2 6.0005 2C6.69136 2 7.25296 2.56976 7.25296 3.27066C7.25296 3.97156 6.69136 4.54132 6.0005 4.54132ZM6.0005 2.67829C5.67513 2.67829 5.41662 2.94508 5.41662 3.27066C5.41662 3.59624 5.67959 3.86303 6.0005 3.86303C6.32142 3.86303 6.58439 3.59624 6.58439 3.27066C6.58439 2.94508 6.32142 2.67829 6.0005 2.67829Z"
                          fill="#17233C"
                        />
                        <path
                          d="M6.0003 9.5C5.81756 9.5 5.66602 9.33289 5.66602 9.13137V4.36863C5.66602 4.16711 5.81756 4 6.0003 4C6.18304 4 6.33459 4.16711 6.33459 4.36863V9.13137C6.33459 9.33289 6.18304 9.5 6.0003 9.5Z"
                          fill="#17233C"
                        />
                        <path
                          d="M6 9.9231C4.66286 9.9231 3.46389 9.05942 3.01817 7.77519C2.98252 7.67119 3.00034 7.55814 3.06274 7.4677C3.12514 7.37726 3.22766 7.323 3.33463 7.323H3.98092C4.16366 7.323 4.3152 7.47674 4.3152 7.66214C4.3152 7.84754 4.16366 8.00129 3.98092 8.00129H3.85612C4.29737 8.76097 5.10857 9.24481 6 9.24481C6.89143 9.24481 7.69817 8.76097 8.14388 8.00129H8.01463C7.83188 8.00129 7.68034 7.84754 7.68034 7.66214C7.68034 7.47674 7.83188 7.323 8.01463 7.323H8.66537C8.77234 7.323 8.87486 7.37726 8.93726 7.4677C8.99965 7.55814 9.01748 7.67119 8.98183 7.77519C8.53611 9.05942 7.33714 9.9231 6 9.9231Z"
                          fill="#17233C"
                        />
                      </svg>
                      <span>Make</span>
                    </div>
                  </div>
                  <div className="sc-21224b6b-3 hZyEQd">YAMAHA</div>
                </div>
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-21224b6b-1 kbnFZE goeXEm bZmyIo">
                  <div>
                    <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-21224b6b-2 kbnFZE goeXEm eaNXo fxHftj">
                      <svg
                        width={15}
                        height={15}
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <line
                          x1="0.659588"
                          y1="1.72132"
                          x2="3.41224"
                          y2="13.6495"
                          stroke="#17233C"
                          strokeWidth="1.1"
                          strokeLinecap="round"
                        />
                        <path
                          d="M1 2.30898C2.16667 1.14232 4.5 0.309082 7 1.80912C9.91041 3.55541 11.8333 3.97565 13 3.30899C12 5.30899 10.3 8.50899 7.5 7.30899C4.7 6.10899 2.5 7.64232 2 8.30899"
                          stroke="#17233C"
                          strokeWidth="1.1"
                        />
                      </svg>
                      <span>Model</span>
                    </div>
                  </div>
                  <div className="sc-21224b6b-3 hZyEQd">SX190</div>
                </div>
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-21224b6b-1 kbnFZE goeXEm bZmyIo">
                  <div>
                    <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-21224b6b-2 kbnFZE goeXEm eaNXo fxHftj">
                      <svg
                        width={12}
                        height={16}
                        viewBox="0 0 12 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.87633 15.8183C4.15596 15.8183 2.49358 15.4002 1.06315 14.603C0.657222 14.3794 0.347941 13.9905 0.222296 13.553C0.0773202 13.0086 0 12.4641 0 11.9197C0 9.22667 1.72037 6.43642 4.01099 5.44476C4.37826 5.27948 4.80352 5.45448 4.96782 5.82392C5.12246 6.19336 4.94849 6.62114 4.58122 6.77669C2.82219 7.54474 1.44975 9.80028 1.44975 11.9197C1.44975 12.3378 1.50774 12.7461 1.62372 13.1544C1.64305 13.2225 1.69138 13.2808 1.7687 13.3197C4.20429 14.6711 7.55805 14.6711 9.99364 13.3197C10.0613 13.2808 10.1193 13.2128 10.1386 13.1544C10.2546 12.7461 10.3126 12.328 10.3126 11.9197C10.3126 9.80028 8.94015 7.54474 7.18111 6.77669C6.80418 6.62114 6.63987 6.19337 6.79451 5.8142C6.94915 5.44476 7.37441 5.26976 7.75135 5.43504C10.0323 6.4267 11.7623 9.21695 11.7623 11.91C11.7623 12.4544 11.685 13.0086 11.54 13.5433C11.4144 13.9808 11.1148 14.3697 10.6992 14.5933C9.25909 15.3905 7.59671 15.8183 5.87633 15.8183Z"
                          fill="#17233C"
                        />
                        <path
                          d="M5.87579 7.15562C3.95245 7.15562 2.38672 5.58063 2.38672 3.64592C2.38672 1.71122 3.95245 0.13623 5.87579 0.13623C7.79913 0.13623 9.36487 1.71122 9.36487 3.64592C9.36487 5.58063 7.79913 7.15562 5.87579 7.15562ZM5.87579 1.59455C4.75465 1.59455 3.83647 2.51816 3.83647 3.64592C3.83647 4.77369 4.75465 5.6973 5.87579 5.6973C6.99693 5.6973 7.91511 4.77369 7.91511 3.64592C7.91511 2.51816 7.0066 1.59455 5.87579 1.59455Z"
                          fill="#17233C"
                        />
                      </svg>
                      <span>Capacity</span>
                    </div>
                  </div>
                  <div className="sc-21224b6b-3 hZyEQd">8</div>
                </div>
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-21224b6b-1 kbnFZE goeXEm bZmyIo">
                  <div>
                    <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-21224b6b-2 kbnFZE goeXEm eaNXo fxHftj">
                      <svg
                        width={16}
                        height={10}
                        viewBox="0 0 16 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.9462 4.68178C15.8662 4.50449 15.7061 4.37555 15.5141 4.33525C15.4181 4.31108 15.2021 4.27885 14.914 4.23049L11.9136 0.765195C11.8096 0.644313 11.6576 0.563723 11.4896 0.555664C11.3375 0.555664 11.1695 0.604021 11.0495 0.716844L7.05696 4.49643C6.28886 4.65761 5.48875 4.86714 4.67264 5.14114C4.60863 3.90008 3.60049 2.90885 2.35232 2.90885H2.32832C1.04814 2.90885 0 3.96455 0 5.25396V5.46349C0 6.26937 0.408056 6.97855 1.01614 7.39761C1.15216 8.54196 2.11229 9.44455 3.28045 9.44455H12.1057C12.9218 9.44455 13.6979 9.00132 14.1139 8.29214L15.9142 5.22172C16.0182 5.06861 16.0262 4.86714 15.9462 4.68178ZM12.1137 8.25184H3.28845C2.80038 8.25184 2.38433 7.92949 2.24831 7.48626C7.353 4.82685 12.4257 5.12502 14.442 5.39096L13.0898 7.69578C12.8818 8.03425 12.5137 8.25184 12.1137 8.25184ZM1.20016 5.27008C1.20016 4.64149 1.70423 4.13378 2.32832 4.13378H2.36032C2.98441 4.13378 3.48848 4.64149 3.48848 5.27008V5.59243C2.8964 5.83419 2.29631 6.1082 1.69623 6.42249C1.40019 6.22102 1.20016 5.87449 1.20016 5.47961V5.27008ZM9.17725 4.16602L11.4256 2.03849L13.1778 4.0532C12.0977 3.98873 10.7215 3.99679 9.17725 4.16602Z"
                          fill="#17233C"
                        />
                      </svg>
                      <span>Boat type</span>
                    </div>
                  </div>
                  <div className="sc-21224b6b-3 hZyEQd">Bow Rider</div>
                </div>
              </div>
            </div>

            <div id="bookingOptions" className="sc-4b8f6fb1-2 gvEUDR">
              <h2 className="sc-3eb0d354-1 cGikrv">Add-ons</h2>
              <div className="sc-31598d9d-0 sc-fbbb656e-0 kbnFZE bcrjrw">
                Explore optional add-ons to tailor your booking at checkout.
              </div>
              <div className="sc-4b8f6fb1-3 cfgxBG">
                <div className="sc-4b8f6fb1-4 ioAmPL">
                  <div className="sc-31598d9d-0 sc-617d572c-0 sc-4b8f6fb1-7 kbnFZE goeXEm bbxNws">
                    <div className="sc-4b8f6fb1-5 bFwIXs">Ice</div>
                    <div className="sc-31598d9d-0 sc-617d572c-0 sc-4b8f6fb1-6 kbnFZE fvhGND jqHNal">
                      <div className="sc-31598d9d-0 sc-fbbb656e-0 kbnFZE bcrjrw">
                        $5
                      </div>
                      <div className="sc-31598d9d-0 sc-fbbb656e-0 sc-4b8f6fb1-0 kbnFZE eideXX bknoQv">
                        {" "}
                        <span className="sc-4b8f6fb1-1 icMzUh">/</span> {/* */}
                        booking
                      </div>
                    </div>
                  </div>
                  <div className="sc-31598d9d-0 sc-617d572c-0 sc-4b8f6fb1-7 kbnFZE goeXEm bbxNws">
                    <div className="sc-4b8f6fb1-5 bFwIXs">Transportation</div>
                    <div className="sc-31598d9d-0 sc-617d572c-0 sc-4b8f6fb1-6 kbnFZE fvhGND jqHNal">
                      <div className="sc-31598d9d-0 sc-fbbb656e-0 kbnFZE bcrjrw">
                        $150
                      </div>
                      <div className="sc-31598d9d-0 sc-fbbb656e-0 sc-4b8f6fb1-0 kbnFZE eideXX bknoQv">
                        {" "}
                        <span className="sc-4b8f6fb1-1 icMzUh">/</span> {/* */}
                        booking
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="singleBoatInfoR">
            <div id="bookingWidget" className="sc-31598d9d-0 sc-617d572c-0 sc-786c3322-2 kbnFZE goeXEm">
              <div className="sc-7f3d6a85-5 bcKqiW">
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-7f3d6a85-1 kbnFZE fvhGND dslQIJ">
                  <div className="sc-7f3d6a85-3 dLSlgt">{(data.durationPrices?.[time])}</div>
                  <div className="sc-7f3d6a85-4 gZXmHD">
                    /{time} (excl. fees)
                  </div>
                </div>
                <form className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 sc-11ed60f3-11 kbnFZE goeXEm jpkWIi jLsUKv">
                  <div className="sc-11ed60f3-7 eeUKug DatePicker">
                    <div className="sc-11ed60f3-6 hDpGCH" onClick={() => setOpenDate(!openDate)}>
                      <div className="sc-5ec5715e-5 kgzSol">
                        <div className="sc-5ec5715e-1 ixAPuh" >
                          <div className="sc-5ec5715e-4 jxtmnV false">Date</div>
                          <div className="sc-5ec5715e-2 gkpCSo" />
                          <div className="sc-5ec5715e-0 kfTYNu">
                            {`${format(date[0].startDate, "MM/dd/yyyy")} to ${format(date[0].endDate, "MM/dd/yyyy")}`}

                          </div>
                          <span >
                          </span>
                        </div>
                        <div className="sc-5ec5715e-3 gNuYoY">
                          <svg
                            width={17}
                            height={17}
                            viewBox="0 0 17 17"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.9624 3.7653H12.4505V1.37806C12.4505 1.0518 12.1869 0.78125 11.869 0.78125C11.5511 0.78125 11.2874 1.0518 11.2874 1.37806V3.7653H4.92169V1.37806C4.92169 1.0518 4.65807 0.78125 4.34017 0.78125C4.02227 0.78125 3.75865 1.0518 3.75865 1.37806V3.7653H3.03756C1.79698 3.7653 0.78125 4.80774 0.78125 6.08093V13.9031C0.78125 15.1763 1.79698 16.2188 3.03756 16.2188H13.9624C15.203 16.2188 16.2188 15.1763 16.2188 13.9031V6.08093C16.2188 4.79978 15.203 3.7653 13.9624 3.7653ZM15.0557 13.8952C15.0557 14.5159 14.5672 15.0172 13.9624 15.0172H3.03756C2.43278 15.0172 1.9443 14.5159 1.9443 13.8952V6.07297C1.9443 5.45228 2.43278 4.95097 3.03756 4.95097H13.9624C14.5672 4.95097 15.0557 5.45228 15.0557 6.07297V13.8952ZM12.8304 6.47084H4.16959C3.85169 6.47084 3.58807 6.7414 3.58807 7.06765V12.9005C3.58807 13.2268 3.85169 13.4973 4.16959 13.4973H12.8304C13.1483 13.4973 13.4119 13.2268 13.4119 12.9005V7.06765C13.4119 6.7414 13.1483 6.47084 12.8304 6.47084ZM12.2489 12.3037H4.75111V7.66446H12.2489V12.3037Z"
                              fill="#5E696A"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {openDate && (
                      <>
                        {data.multiBooking === "yes" ? (
                          <div className="CaLaNder">
                            <div className="calenderBtn">
                              <button onClick={handleSingleDayClick}>One Day</button>
                              <button onClick={handleMultiDayClick}>Multiple Day</button>
                            </div>
                            {singleDay && (
                              <DateRange
                                minDate={currentDate}
                                editableDateInputs={false}
                                moveRangeOnFirstSelection={false}
                                ranges={date}
                                onChange={handleSelect}
                                disabledDates={formattedBookedDates}
                              />
                            )}

                            {multiDay && (
                              <DateRangePicker
                                minDate={currentDate}
                                editableDateInputs={true}
                                moveRangeOnFirstSelection={false}
                                ranges={date}
                                onChange={(item) => setDate([item.selection])}
                                className="dateRange"
                                disabledDates={formattedBookedDates}
                              />
                            )}
                            <button className="dateApply" onClick={(e) => {
                              e.preventDefault();
                              calculateDay(e);
                            }}>Apply</button>

                          </div>
                        ) : (
                          <>
                            <DateRange
                              minDate={currentDate}
                              editableDateInputs={false}
                              moveRangeOnFirstSelection={false}
                              ranges={date}
                              onChange={handleSelect}
                              disabledDates={formattedBookedDates}
                            />
                            <button className="dateApply" onClick={calculateDay}>Apply</button>
                          </>
                        )}
                      </>
                    )}
                    <input type="hidden" name="trip_start" defaultValue="" />
                  </div>
                  <div className="sc-11ed60f3-7 eeUKug">
                    <div>
                      <div className="sc-c55a9e21-3 jweEUb null" onClick={() => setOpenTime(!openTime)}>
                        <div className="sc-c55a9e21-4 kAFBlW">
                          <div className="sc-c55a9e21-5 fkXugm">
                            <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 kbnFZE goeXEm jpkWIi SeLectGrp">
                              <div className="sc-c55a9e21-7 gLJKxr">
                                <div className="sc-c55a9e21-8 gJcfkx">
                                  Duration
                                </div>
                                <div className="sc-c55a9e21-2 jhNDLd dURaTiOn">

                                  {numberDays === 1 && requestButton === "Duration" ? (
                                    <>
                                      <p style={{ fontSize: "12px" }}> {time}</p>
                                      {openTime && data.timePeriod && (
                                        <div className="DuRaTiON">
                                          {data.timePeriod.map((item) => (
                                            <div className="duratIonTab" onClick={pickTime}>{item}</div>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <p style={{ fontSize: "12px" }}> {numberDays} days</p>

                                  )}


                                </div>
                              </div>
                            </div>
                            <div className="sc-c55a9e21-1 cOZJMe">
                              <svg
                                width={17}
                                height={18}
                                viewBox="0 0 17 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle
                                  cx="7.5"
                                  cy="10.5"
                                  r="6.9"
                                  stroke="#5E696A"
                                  strokeWidth="1.2"
                                />
                                <line
                                  x1="7.5"
                                  y1={4}
                                  x2="7.5"
                                  y2={2}
                                  stroke="#5E696A"
                                />
                                <line
                                  x1="7.5"
                                  y1="10.5"
                                  x2="7.5"
                                  y2="6.5"
                                  stroke="#5E696A"
                                  strokeLinecap="round"
                                />
                                <line
                                  x1="13.8828"
                                  y1="6.79892"
                                  x2="14.7488"
                                  y2="6.29892"
                                  stroke="#5E696A"
                                />
                                <line
                                  x1="6.6"
                                  y1="1.4"
                                  x2="8.4"
                                  y2="1.4"
                                  stroke="#5E696A"
                                  strokeWidth="1.2"
                                  strokeLinecap="round"
                                />
                                <line
                                  x1="14.8196"
                                  y1="5.21962"
                                  x2="15.7196"
                                  y2="6.77846"
                                  stroke="#5E696A"
                                  strokeWidth="1.2"
                                  strokeLinecap="round"
                                />
                                <circle cx="7.5" cy={11} r={1} fill="#5E696A" />
                              </svg>
                            </div>
                          </div>
                          <div className="sc-c55a9e21-0 cDSRqQ" />
                        </div>
                      </div>
                    </div>
                    <input type="hidden" name="duration" defaultValue={6} />
                  </div>
                  <div className="sc-11ed60f3-7 ebpkmB">
                    <div>
                      <div
                        className="sc-c55a9e21-3 jweEUb hasError null TiMeInTeRvAl" onClick={() => {
                          generateHalfHourIntervals();
                          setOpen(!open);
                        }}>
                        <div className="sc-c55a9e21-4 kAFBlW">
                          <div className="sc-c55a9e21-5 fkXugm">
                            <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 kbnFZE goeXEm jpkWIi">
                              <div className="sc-c55a9e21-6 hoqjYK">
                                Start time
                              </div>
                            </div>
                            <div className="sc-c55a9e21-1 cOZJMe">
                              <svg
                                width={17}
                                height={17}
                                viewBox="0 0 17 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11.6728 9.67914H7.99576C7.6777 9.67914 7.41395 9.41538 7.41395 9.09732V5.42802C7.41395 5.10996 7.6777 4.8462 7.99576 4.8462C8.31382 4.8462 8.57758 5.10996 8.57758 5.42802V8.51551H11.6651C11.9831 8.51551 12.2469 8.77926 12.2469 9.09732C12.2469 9.41538 11.9909 9.67914 11.6728 9.67914ZM16.2188 8.50002C16.2188 4.24113 12.7589 0.78125 8.5 0.78125C4.24111 0.78125 0.78125 4.24889 0.78125 8.50002C0.78125 12.7589 4.24887 16.2187 8.5 16.2187C12.7511 16.2187 16.2188 12.7589 16.2188 8.50002ZM15.0551 8.50002C15.0551 12.115 12.115 15.0551 8.5 15.0551C4.88499 15.0551 1.94488 12.115 1.94488 8.50002C1.94488 4.885 4.88499 1.94488 8.5 1.94488C12.1073 1.93713 15.0551 4.885 15.0551 8.50002Z"
                                  fill="#5E696A"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="sc-c55a9e21-0 cDSRqQ">
                            {startTime}
                          </div>
                        </div>
                      </div>
                      {open && (
                        <div className="StaRtTime" onClick={() => {
                          setOpen(!open);

                        }} >
                          {interval.map((item, index) => (
                            <span className="StaRtinTerval" onClick={(e) => {
                              setStartTime(e.currentTarget.querySelector('p').textContent)
                              setOpenPasanger(!openPasanger)
                            }}>
                              <input type="checkbox"></input>
                              <p>{item}</p>
                            </span>
                          ))}
                        </div>

                      )}
                    </div>
                  </div>
                  {openPasanger && (
                    <div className="paSSanGer">
                      <div className="sc-c55a9e21-4 kAFBlW">
                        <div className="sc-c55a9e21-5 fkXugm">
                          <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 kbnFZE goeXEm jpkWIi">
                            <div style={{ fontSize: "16px" }}>Passangers</div>
                          </div><div className="sc-c55a9e21-1 cOZJMe">
                            {/* <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.6728 9.67914H7.99576C7.6777 9.67914 7.41395 9.41538 7.41395 9.09732V5.42802C7.41395 5.10996 7.6777 4.8462 7.99576 4.8462C8.31382 4.8462 8.57758 5.10996 8.57758 5.42802V8.51551H11.6651C11.9831 8.51551 12.2469 8.77926 12.2469 9.09732C12.2469 9.41538 11.9909 9.67914 11.6728 9.67914ZM16.2188 8.50002C16.2188 4.24113 12.7589 0.78125 8.5 0.78125C4.24111 0.78125 0.78125 4.24889 0.78125 8.50002C0.78125 12.7589 4.24887 16.2187 8.5 16.2187C12.7511 16.2187 16.2188 12.7589 16.2188 8.50002ZM15.0551 8.50002C15.0551 12.115 12.115 15.0551 8.5 15.0551C4.88499 15.0551 1.94488 12.115 1.94488 8.50002C1.94488 4.885 4.88499 1.94488 8.5 1.94488C12.1073 1.93713 15.0551 4.885 15.0551 8.50002Z" fill="#5E696A"></path></svg> */}
                          </div></div><div className="sc-c55a9e21-0 cDSRqQ">10:30 AM</div></div>
                      <input type="Number" placeholder="No.Of Passangers" name="passanger" value={passanger.passanger} onChange={handleChange}></input>
                    </div>
                  )}
                  {requestButton === "Duration" ? (<div className="sc-11ed60f3-3 blhwGp">
                    <div className="sc-70c53a93-2 EwZPu">
                      <button type="submit" className="sc-4eb7135f-0 bRkdOl button renterBg uppercase sc-70c53a93-0 tmTCU"
                        onClick={calculatePrice}
                      >
                        <span className="buttonText">Request to book</span>
                      </button>
                    </div>
                  </div>) : (<div className="sc-11ed60f3-3 blhwGp" >
                    <div className="sc-70c53a93-2 EwZPu" >
                      <button
                        className="sc-4eb7135f-0 bRkdOl button renterBg   uppercase    sc-70c53a93-0 tmTCU"
                        onClick={inquiryHandel}
                      >
                        <span className="buttonText" >Get A Quotation</span>
                      </button>
                    </div>
                  </div>)}
                  {/* <div className="sc-11ed60f3-3 blhwGp">
                    <div className="sc-70c53a93-2 EwZPu">
                      <button
                        type="submit"
                        className="sc-4eb7135f-0 bRkdOl button renterBg   uppercase    sc-70c53a93-0 tmTCU"
                      >
                        <span className="buttonText">Request to book</span>
                      </button>
                    </div>
                  </div> */}
                </form>
                <div className="sc-7f3d6a85-2 juXcyw">
                  You won't be charged yet
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lineDivider"></div>
        <div className="sc-3eb0d354-2 sc-b356c254-0  fmtPHT">
          <div id="reviews" className="sc-3eb0d354-2 sc-b356c254-0 fmtPHT">
            <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 sc-b356c254-3 kbnFZE goeXEm jpkWIi hcJXXt">
              <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-20 sc-b356c254-4 kbnFZE  imSaoR jeejUO">
                <h2 className="sc-3eb0d354-1 cGikrv">
                  {" "}
                  Ratings &amp; reviews{" "}
                </h2>
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 kbnFZE fvhGND eaNXo">
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{ stopColor: "#72D4BA", stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#DBDFE5", stopOpacity: 1 }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-35c925f6-0 kbnFZE goeXEm eaNXo bNZyqH">
                    <div className="sc-35c925f6-1 gHCpEH">5.0</div>
                    <div className="sc-35c925f6-2 fJiFNs">
                      ({/* */}3{/* */} ratings{/* */})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sc-b356c254-2 cucjfw cucjfw1">
            <div className="sc-31598d9d-0 sc-617d572c-0 sc-11cea843-0 kbnFZE goeXEm ewtzzz">
              <div
                width="100%"
                className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 sc-11cea843-1 kgFNhc iYfExt jpkWIi cMGhTY"
              >
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-11cea843-2 kbnFZE goeXEm eaNXo dWOPDy">
                  <img
                    alt="Austin"
                    src="https://ui-avatars.com/api/&name=A&background=F4F8F9&color=8E9697&size=100&length=1&font-size=0.6&bold=true"
                    className="sc-11cea843-3 jNZmpJ"
                  />
                  <div>
                    <div
                      fontSize="16px"
                      className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-11cea843-4 kbnFZE goeXEm eaNXo kpnuYP"
                    >
                      Austin
                    </div>
                    <div className="sc-11cea843-5 cFwwNw">Sep 2023</div>
                  </div>
                </div>
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 kbnFZE fvgjSp eaNXo">
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                </div>
                <div className="sc-11cea843-6 sc-11cea843-9 dzuSfE diyQms">
                  Ryan was a great host fast communication and had the boat
                  ready for us early and was there when we got back! Definitely
                  recommend!{" "}
                </div>
              </div>
            </div>
            <div className="sc-31598d9d-0 sc-617d572c-0 sc-11cea843-0 kbnFZE goeXEm ewtzzz">
              <div
                width="100%"
                className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 sc-11cea843-1 kgFNhc iYfExt jpkWIi cMGhTY"
              >
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-11cea843-2 kbnFZE goeXEm eaNXo dWOPDy">
                  <img
                    alt="Astrid"
                    src="https://s3.amazonaws.com/boatsetter-prod/users/profile_images/000/857/004/square_50/BBD5DCC2-7C99-479C-9F9B-7575C409A778.jpeg?1691035129"
                    className="sc-11cea843-3 jNZmpJ"
                  />
                  <div>
                    <div
                      fontSize="16px"
                      className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-11cea843-4 kbnFZE goeXEm eaNXo kpnuYP"
                    >
                      Astrid
                    </div>
                    <div className="sc-11cea843-5 cFwwNw">Sep 2023</div>
                  </div>
                </div>
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 kbnFZE fvgjSp eaNXo">
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                </div>
                <div className="sc-11cea843-6 sc-11cea843-9 dzuSfE diyQms">
                  I highly recommend renting with Ryan! This boat was spacious
                  for 7 of us and we moved around with ease. Ryan provided life
                  jackets, tube, and a wake surf board. My family and I enjoyed
                  ourselves and it was well worth it! Will definitely rent
                  again.{" "}
                </div>
                <span className="sc-11cea843-10 bHXGru">Read more</span>
              </div>
            </div>
            <div className="sc-31598d9d-0 sc-617d572c-0 sc-11cea843-0 kbnFZE goeXEm ewtzzz">
              <div
                width="100%"
                className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 sc-11cea843-1 kgFNhc iYfExt jpkWIi cMGhTY"
              >
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-11cea843-2 kbnFZE goeXEm eaNXo dWOPDy">
                  <img
                    alt="Cody"
                    src="https://s3.amazonaws.com/boatsetter-prod/users/profile_images/000/227/281/square_50/picture?1526272640"
                    className="sc-11cea843-3 jNZmpJ"
                  />
                  <div>
                    <div
                      fontSize="16px"
                      className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-11cea843-4 kbnFZE goeXEm eaNXo kpnuYP"
                    >
                      Cody
                    </div>
                    <div className="sc-11cea843-5 cFwwNw">Aug 2023</div>
                  </div>
                </div>
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 kbnFZE fvgjSp eaNXo">
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="grad100"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(114, 212, 186)",
                            stopOpacity: 1,
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: "rgb(219, 223, 229)",
                            stopOpacity: 1,
                          }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                      fill="url(#grad100)"
                    />
                  </svg>
                </div>
                <div className="sc-11cea843-6 sc-11cea843-9 dzuSfE diyQms">
                  Great experience, boat, and toys. Awesome owner. Highly
                  recommend!
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lineDivider"></div>

        <div className="sc-3eb0d354-2 fjyxif">
          <h2 className="sc-3eb0d354-1 cGikrv">Your crew</h2>
          <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 kbnFZE iYgCul jpkWIi">
            <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 sc-261f0ec8-2 kbnFZE goeXEm jpkWIi cEjJVT">
              <div className="sc-261f0ec8-3 ggPZgq ggPZgq1">Boat owner</div>
              <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-1 sc-11cea843-1 kbnFZE goeXEm jpkWIi cMGiJl">
                <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-11cea843-2 kbnFZE goeXEm eaNXo dWOPDy">
                  <img
                    alt="Ryan"
                    src="https://s3.amazonaws.com/boatsetter-prod/users/profile_images/001/044/169/square_50/17BE9D18-B8A9-49B3-8311-1999C023636D.jpg?1692475772"
                    className="sc-11cea843-3 gpWmjB"
                  />
                  <div>
                    <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-11cea843-4 kbnFZE goeXEm eaNXo kVssKV">
                      Ryan
                    </div>
                    <div>
                      <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 kbnFZE fvhGND eaNXo">
                        <svg
                          width={16}
                          height={16}
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <linearGradient
                              id="grad100"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop
                                offset="100%"
                                style={{
                                  stopColor: "#72D4BA",
                                  stopOpacity: 1,
                                }}
                              />
                              <stop
                                offset="100%"
                                style={{
                                  stopColor: "#DBDFE5",
                                  stopOpacity: 1,
                                }}
                              />
                            </linearGradient>
                          </defs>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8.348 12.723a.6.6 0 0 0-.696 0L4.43 15.02a.6.6 0 0 1-.927-.648l1.109-4.029a.6.6 0 0 0-.2-.624L1.236 7.121a.6.6 0 0 1 .36-1.064l3.963-.135a.6.6 0 0 0 .547-.405l1.328-3.865a.6.6 0 0 1 1.134 0l1.328 3.865a.6.6 0 0 0 .547.405l3.963.135a.6.6 0 0 1 .36 1.064L11.586 9.72a.6.6 0 0 0-.199.624l1.11 4.029a.6.6 0 0 1-.928.648l-3.22-2.297Z"
                            fill="url(#grad100)"
                          />
                        </svg>
                        <div className="sc-31598d9d-0 sc-617d572c-0 sc-617d572c-3 sc-35c925f6-0 kbnFZE goeXEm eaNXo bNZyqH">
                          <div className="sc-35c925f6-1 gHCpEH">5.0</div>
                          <div className="sc-35c925f6-2 fJiFNs">
                            ({/* */}3{/* */} bookings{/* */})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <NavLink to="" className="sc-11cea843-7 btfCuh">
                  See profile
                </NavLink>
              </div>
              <div>
                <ul className="sc-261f0ec8-4 cWpKCk">
                  <li>
                    Response rate:{" "}
                    <span className="sc-261f0ec8-0 bprIqd">84%</span>
                  </li>
                  <li>
                    Avg. response time:{" "}
                    <span className="sc-261f0ec8-0 bprIqd">&lt; 12 hours</span>
                  </li>
                </ul>
                <div>
                  <button type="button" className="uppercase outline">
                    <span className="buttonText">MESSAGE OWNER</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <CheckOutPage /> */}
      <Footer />
    </>
  );
}
