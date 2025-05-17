import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, X } from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { checkin } from "../../api/auth";
import { verifyScannedQRCode } from "../../api/qrcode";
import { useUser } from "../../context/UserContext";

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useUser();

  const navigate = useNavigate();

  const startScanner = async () => {
    try {
      // Request camera permissions before starting the scanner
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setHasPermission(true);
      setScanning(true);
    } catch (error) {
      alert("Camera access denied! Please allow camera permissions.");
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scanner) {
      scanner
        .clear()
        .then(() => {
          setScanner(null);
          setScanning(false);
          setHasPermission(false);
        })
        .catch((error) => console.error("Failed to stop scanner:", error));
    } else {
      setScanning(false);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    if (scanning && hasPermission && !scanner) {
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          rememberLastUsedCamera: true,
        },
        false
      );

      qrScanner.render(
        async (decodedText) => {
          console.log("Scanned QR Code:", decodedText);
          setQrCode(decodedText);

          try {
            const response = await verifyScannedQRCode(decodedText);
            if (response.success) {
              console.log("QR Code verified successfully:", response.message);
            } else {
              console.error("QR Code verification failed:", response.message);
            }
          } catch (error) {
            console.error("Error verifying QR Code:", error);
          }

          qrScanner
            .clear()
            .then(() => {
              setScanner(null);
              setScanning(false);
              setHasPermission(false);
            })
            .catch((error) => console.error("Failed to clear scanner:", error));
        },
        (errorMessage) => {
          console.log("QR Scan Error:", errorMessage);
        }
      );

      setScanner(qrScanner);
    }
  }, [scanning, hasPermission, scanner]);

  const validateInput = (name: string, value: string) => {
    switch (name) {
      case "firstName":
        return value.trim() === ""
          ? "First name is required"
          : !/^[a-zA-Z\s]*$/.test(value)
          ? "First name should only contain letters"
          : "";
      case "lastName":
        return value.trim() === ""
          ? "Last name is required"
          : !/^[a-zA-Z\s]*$/.test(value)
          ? "Last name should only contain letters"
          : "";
      case "phoneNumber":
        return value.trim() === ""
          ? "Phone number is required"
          : !/^\d{10}$/.test(value)
          ? "Phone number must be 10 digits"
          : "";
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phoneNumber" && !/^\d*$/.test(value)) {
      return;
    }

    switch (name) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "phoneNumber":
        setPhoneNumber(value);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: validateInput(name, value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      firstName: validateInput("firstName", firstName),
      lastName: validateInput("lastName", lastName),
      phoneNumber: validateInput("phoneNumber", phoneNumber),
    };

    setErrors(newErrors);

    if (!Object.values(newErrors).some((error) => error !== "")) {
      setIsSubmitting(true);
      try {
        if (!qrCode) {
          throw new Error("QR code is missing");
        }

        const response = await checkin(
          qrCode,
          firstName,
          lastName,
          phoneNumber
        );

        localStorage.setItem("token", response.token);
        const user = {
          firstName: response.customer.firstName,
          lastName: response.customer.lastName,
          phone: response.customer.phone,
        };
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", response.customer._id.toString());
        setUser(user);
        navigate("/cart");
      } catch (error) {
        console.error("Login failed:", error);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-[60%] p-3 pt-0 overflow-auto">
      {!qrCode ? (
        <>
          <div className="w-full max-w-sm bg-gray-200 rounded-lg shadow-lg p-6 text-center flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-gray-700">Start Shopping</h2>
            <p className="text-lg text-gray-600 mt-2">
              Start your session and enjoy shopping
            </p>

            <button
              onClick={startScanner}
              className="mt-6 p-5 rounded-lg bg-gray-300 hover:bg-gray-400 transition shadow-lg"
            >
              <QrCode size={150} className="text-gray-700" />
            </button>

            <p className="text-md pt-5 text-gray-600 mt-3">
              Click on the icon to scan the QR code
            </p>
          </div>

          <AnimatePresence>
            {scanning && hasPermission && (
              <>
                <motion.div
                  style={{
                    position: "fixed",
                    inset: "0",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    zIndex: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  style={{
                    position: "fixed",
                    inset: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 50,
                  }}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="w-full max-w-sm bg-gray-200 bg-opacity-90 backdrop-blur-lg p-5 rounded-2xl shadow-2xl text-center border m-4 border-gray-300">
                    <h2 className="text-3xl font-bold text-gray-800">
                      Scan a QR Code
                    </h2>

                    <div
                      id="qr-reader"
                      className="w-full mt-6 rounded-lg overflow-hidden border border-gray-300 shadow-inner"
                    />

                    <button
                      onClick={stopScanner}
                      className="mt-6 p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                    >
                      <X size={36} />
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      ) : (
        <motion.div
          {...{ className: "w-full max-w-md h-full overflow-auto" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">
            Customer Details
          </h1>

          <form onSubmit={handleSubmit}>
            <motion.div
              {...{ className: "bg-white p-5 rounded-2xl shadow-xl space-y-6" }}
            >
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
                  placeholder="Enter your first name"
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
                  placeholder="Enter your last name"
                  disabled={isSubmitting}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">{errors.lastName}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={phoneNumber}
                    onChange={handleInputChange}
                    maxLength={10}
                    pattern="\d*"
                    inputMode="numeric"
                    className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors`}
                    placeholder="Enter 10-digit number"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs">{errors.phoneNumber}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 font-medium rounded-lg shadow-lg 
                transition-all duration-300 flex items-center justify-center
                ${
                  isSubmitting
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
                } text-white`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Starting...
                  </div>
                ) : (
                  "Start Shopping"
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default QRScanner;
