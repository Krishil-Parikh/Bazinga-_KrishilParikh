import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeClosed } from "lucide-react";
import toast from "react-hot-toast";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    password: "",
    confirmPassword: "",
    pincode: "",
    city: "",
    region: "",
    role: "",
  });
  
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.whatsapp.match(/^\d{10}$/))
      newErrors.whatsapp = "Enter a valid 10-digit WhatsApp number";
    if (!formData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/))
      newErrors.email = "Enter a valid email address";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.pincode.match(/^\d{6}$/))
      newErrors.pincode = "Enter a valid 6-digit pincode";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.region) newErrors.region = "Region is required";
    if (!formData.role) newErrors.role = "Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const response = await axios.post("/api/signup", formData);
      toast.success("Signup successful");
    } catch (error) {
      toast.error("Signup failed");
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
      {/* <h2 className="text-xl font-semibold text-gray-700">Sign Up</h2> */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(formData).map((field) => (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            {field === "password" || field === "confirmPassword" ? (
              <div className="relative">
                <input
                  type={showPassword ? "password" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
                <div
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-2 right-2.5 cursor-pointer"
                >
                  {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                </div>
              </div>
            ) : field === "region" || field === "role" ? (
              <select
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">Select {field}</option>
                {field === "region" ? (
                  ["North", "South", "East", "West"].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))
                ) : (
                  ["Hospital", "Moderator"].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))
                )}
              </select>
            ) : (
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            )}
            {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
          </div>
        ))}

        <button
          type="submit"
          className="w-full py-2 bg-[#27912d] hover:bg-[#28852d] active:bg-[#26702a] text-white font-semibold rounded-md transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
