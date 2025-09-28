import Button from "../../../components/ui/Button";
import FormInput from "../../../components/ui/FormInput";
import CheckboxGroup from "../../../components/ui/CheckboxGroup";
import Footer from "../../../components/layout/Footer";

const skillsOptions = [
  "Tutoring",
  "First Aid",
  "Translation",
  "Marketing",
  "Graphic Design",
  "Cooking",
  "Photography",
  "Fundraising",
];
const interestsOptions = [
  "Environment",
  "Disaster Relief",
  "Children & Youth",
  "Health & Wellness",
  "Education",
  "Elderly Care",
  "Animal Welfare",
  "Community Development",
];

export default function ProfileStep({ formData, updateField, onPrev }) {
  const handleCheckboxChange = (field, value) => {
    updateField(
      field,
      formData[field].includes(value)
        ? formData[field].filter((v) => v !== value)
        : [...formData[field], value]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Volunteer registered successfully!");
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Complete Volunteer Profile
        </h2>
        <p className="text-gray-600">
          Tell us more about yourself so we can match you with the right opportunities.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 w-full max-w-3xl space-y-4"
      >
        <span className="text-gray-600 text-center"> Step 1 of 2</span>
        <h2 className="text-xl font-bold text-center mb-4">
          Complete Your Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Birthdate"
            type="date"
            value={formData.birthdate}
            onChange={(val) => updateField("birthdate", val)}
          />
          <FormInput
            label="Gender"
            type="select"
            options={["Male", "Female", "Other"]}
            value={formData.gender}
            onChange={(val) => updateField("gender", val)}
          />
          <FormInput
            label="Contact Number"
            value={formData.contact}
            placeholder="e.g., +1234567890"
            onChange={(val) => updateField("contact", val)}
          />
          <FormInput
            label="City"
            value={formData.city}
            placeholder="Your city"
            onChange={(val) => updateField("city", val)}
          />
          <FormInput
            label="Address"
            placeholder="Street, Building, etc."
            value={formData.address}
            onChange={(val) => updateField("address", val)}
          />
        </div>

        <CheckboxGroup
          label="Skills & Expertise"
          options={skillsOptions}
          selected={formData.skills}
          onChange={(val) => handleCheckboxChange("skills", val)}
        />

        <CheckboxGroup
          label="Interests & Causes"
          options={interestsOptions}
          selected={formData.interests}
          onChange={(val) => handleCheckboxChange("interests", val)}
        />

        <FormInput
          label="Availability"
          type="select"
          options={["Weekdays", "Weekends", "Evenings"]}
          value={formData.availability}
          onChange={(val) => updateField("availability", val)}
        />

        <FormInput
          label="Bio & Motivation"
          type="textarea"
          placeholder="Tell us about yourself and why you want to volunteer"
          value={formData.bio}
          onChange={(val) => updateField("bio", val)}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrev}>
            Back
          </Button>
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </div>
      </form>
      <Footer />
    </div>
  );
}
