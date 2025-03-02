import axios from "axios";
import { Eye, EyeClosed } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(true);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [usernameEdited, setUsernameEdited] = useState(false);

  // Updated state to include fields from the schema
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    // We store a single record for now; convert to array on submit if provided.
    medicalHistory: {
      condition: "",
      diagnosedDate: "",
      status: "" // Options: "Ongoing", "Recovered"
    },
    lifestyleFactors: {
      smoker: false,
      alcoholConsumption: false,
      exerciseFrequency: "None" // Options: "None", "Rarely", "Occasionally", "Regularly"
    },
    // Similarly for family medical history
    familyMedicalHistory: {
      relation: "",
      condition: ""
    },
    height: "",
    weight: "",
  });

  const handleChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (field === "username") {
      setUsernameEdited(true);
    }
  };

  // Helper to update nested objects (e.g.,medicalHistory, lifestyleFactors, familyMedicalHistory)
  const handleNestedChange = (parent, field, value) => {
    setUserData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  useEffect(() => {
    if (!usernameEdited) return;

    if (userData.username.trim() === "") {
      setMessage("Username required");
    } else {
      setMessage("");
    }
  }, [userData.username, usernameEdited]);

//   const checkAvailability = async () => {
//     try {
//       if (userData.username.trim() === "") return;
//       const { data } = await axios.post('http://localhost:8500/user/username', { username: userData.username });
//       setMessage(data.message);
//     } catch (error) {
//       console.log("Error checking username availability", error);
//     }
//   };

  const userSignUp = async () => {
    try {
      // Basic required fields check (expand as needed)
      if (
        !userData.firstName ||
        !userData.lastName ||
        !userData.email ||
        !userData.username ||
        !userData.password ||
        !userData.confirmPassword
      ) {
        toast.error("Please fill all the required fields", { position: "top-right" });
        return;
      }

      // Prepare payload:
      const payload = {
        ...userData,
        // Convert nested medicalHistory and familyMedicalHistory to arrays if filled
        medicalHistory: userData.medicalHistory.condition
          ? [userData.medicalHistory]
          : [],
        familyMedicalHistory: userData.familyMedicalHistory.relation
          ? [userData.familyMedicalHistory]
          : []
      };

      const { data } = await axios.post('http://localhost:8500/auth/signup', payload);
      toast.success("Registration successful", { position: "top-right" });
      localStorage.setItem("airesumex_token", JSON.stringify(data.token));
      navigate('/dashboard');
    } catch (error) {
      console.log("Could not register user", error);
      toast.error("Registration failed!", { position: 'top-right' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          First Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter your first name"
          value={userData.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Last Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter your last name"
          value={userData.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          placeholder="m@example.com"
          value={userData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Username <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Choose a username"
          value={userData.username}
          onChange={(e) => handleChange("username", e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
        {message && (
          <p className={`text-[0.75rem] ${message === "Username available!" ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "password" : "text"}
            placeholder="Create a strong password"
            value={userData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
          <div onClick={() => setShowPassword((prev) => !prev)} className="absolute top-2 right-2.5 cursor-pointer">
            {showPassword ? <Eye color="#696969" size={20} /> : <EyeClosed color="#696969" size={20} />}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Confirm Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "password" : "text"}
            placeholder="Confirm password"
            value={userData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
          <div onClick={() => setShowPassword((prev) => !prev)} className="absolute top-2 right-2.5 cursor-pointer">
            {showPassword ? <Eye color="#696969" size={20} /> : <EyeClosed color="#696969" size={20} />}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="text"
          placeholder="Enter your phone number"
          value={userData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            value={userData.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={userData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      

      {/* Medical History */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Medical History (Optional)</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <input
            type="text"
            placeholder="e.g., Diabetes"
            value={userData.medicalHistory.condition}
            onChange={(e) => handleNestedChange("medicalHistory", "condition", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Diagnosed Date</label>
            <input
              type="date"
              value={userData.medicalHistory.diagnosedDate}
              onChange={(e) => handleNestedChange("medicalHistory", "diagnosedDate", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={userData.medicalHistory.status}
              onChange={(e) => handleNestedChange("medicalHistory", "status", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">Select status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Recovered">Recovered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lifestyle Factors */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Lifestyle Factors</h3>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={userData.lifestyleFactors.smoker}
              onChange={(e) => handleNestedChange("lifestyleFactors", "smoker", e.target.checked)}
            />
            <span className="text-sm">Smoker</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={userData.lifestyleFactors.alcoholConsumption}
              onChange={(e) =>
                handleNestedChange("lifestyleFactors", "alcoholConsumption", e.target.checked)
              }
            />
            <span className="text-sm">Alcohol</span>
          </label>
        </div>
        <div className="space-y-2 mt-2">
          <label className="block text-sm font-medium text-gray-700">Exercise Frequency</label>
          <select
            value={userData.lifestyleFactors.exerciseFrequency}
            onChange={(e) =>
              handleNestedChange("lifestyleFactors", "exerciseFrequency", e.target.value)
            }
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="None">None</option>
            <option value="Rarely">Rarely</option>
            <option value="Occasionally">Occasionally</option>
            <option value="Regularly">Regularly</option>
          </select>
        </div>
      </div>

      {/* Family Medical History */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Family Medical History (Optional)</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Relation</label>
          <input
            type="text"
            placeholder="e.g., Father"
            value={userData.familyMedicalHistory.relation}
            onChange={(e) => handleNestedChange("familyMedicalHistory", "relation", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div className="space-y-2 mt-2">
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <input
            type="text"
            placeholder="e.g., Hypertension"
            value={userData.familyMedicalHistory.condition}
            onChange={(e) => handleNestedChange("familyMedicalHistory", "condition", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
            <input
              type="number"
              placeholder="e.g., 170"
              value={userData.height}
              onChange={(e) => handleChange("height", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              placeholder="e.g., 65"
              value={userData.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={userSignUp}
        className="w-full px-4 py-2.5 text-sm text-white font-medium bg-[#27912d] hover:bg-[#28852d] active:bg-[#26702a] transition duration-200 rounded-md"
      >
        Sign up
      </button>
    </div>
  );
};

export default Signup;
