import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github,
  Save,
  Eye,
  Edit,
  Plus,
  X,
  Calendar,
  Building,
  FileText
} from 'lucide-react';
import supabase from '../api/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  
  const [profileData, setProfileData] = useState({
    personal: {
      full_name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: ''
    },
    experience: [],
    education: [],
    skills: [],
    achievements: []
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfileData();
  }, [user, navigate, authLoading]);

  const loadProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      } else if (data) {
        setProfileData({
          personal: data.personal_info || {},
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || [],
          achievements: data.achievements || []
        });
      } else {
        // Initialize with user metadata
        setProfileData(prev => ({
          ...prev,
          personal: {
            ...prev.personal,
            full_name: user.user_metadata?.full_name || '',
            email: user.email || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfileData = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          personal_info: profileData.personal,
          experience: profileData.experience,
          education: profileData.education,
          skills: profileData.skills,
          achievements: profileData.achievements,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updatePersonalInfo = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const addExperience = () => {
    setProfileData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        current: false,
        description: ''
      }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        school: '',
        degree: '',
        field: '',
        start_date: '',
        end_date: '',
        current: false,
        gpa: ''
      }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    const skill = prompt('Enter a skill:');
    if (skill && skill.trim()) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (index) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addAchievement = () => {
    setProfileData(prev => ({
      ...prev,
      achievements: [...prev.achievements, {
        id: Date.now(),
        title: '',
        description: '',
        date: '',
        type: 'award'
      }]
    }));
  };

  const updateAchievement = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.map(ach => 
        ach.id === id ? { ...ach, [field]: value } : ach
      )
    }));
  };

  const removeAchievement = (id) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(ach => ach.id !== id)
    }));
  };

  if (authLoading) {
    return <LoadingSpinner label="Checking your session…" className="min-h-screen" />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (showPreview) {
    return <ProfilePreview profileData={profileData} onBack={() => setShowPreview(false)} />;
  }

  return (
    <div className="min-h-screen bg-bridge-page">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Profile</h1>
          <p className="text-stone-600">Manage your professional information for mentors to view</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Preview Resume
          </button>
          <button
            onClick={saveProfileData}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg hover:from-orange-500 hover:to-amber-400 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-stone-200">
          <nav className="flex space-x-8">
            {['personal', 'experience', 'education', 'skills', 'achievements'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeSection === section
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                {section}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-2xl shadow-bridge-card p-8">
          {/* Personal Information */}
          {activeSection === 'personal' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-stone-900">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.personal.full_name}
                    onChange={(e) => updatePersonalInfo('full_name', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Professional Title</label>
                  <input
                    type="text"
                    value={profileData.personal.title}
                    onChange={(e) => updatePersonalInfo('title', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="Software Engineer"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Bio</label>
                  <textarea
                    value={profileData.personal.bio}
                    onChange={(e) => updatePersonalInfo('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.personal.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.personal.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={profileData.personal.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="San Francisco, CA"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={profileData.personal.website}
                    onChange={(e) => updatePersonalInfo('website', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="https://johndoe.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={profileData.personal.linkedin}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">GitHub</label>
                  <input
                    type="url"
                    value={profileData.personal.github}
                    onChange={(e) => updatePersonalInfo('github', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="https://github.com/johndoe"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Experience */}
          {activeSection === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-stone-900">Work Experience</h2>
                </div>
                <button
                  onClick={addExperience}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Experience
                </button>
              </div>
              
              <div className="space-y-4">
                {profileData.experience.map((exp) => (
                  <div key={exp.id} className="border border-stone-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-stone-900">Work Experience</h3>
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          placeholder="Company Name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          placeholder="Job Title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Start Date</label>
                        <input
                          type="month"
                          value={exp.start_date}
                          onChange={(e) => updateExperience(exp.id, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">End Date</label>
                        <input
                          type="month"
                          value={exp.end_date}
                          onChange={(e) => updateExperience(exp.id, 'end_date', e.target.value)}
                          disabled={exp.current}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors disabled:bg-stone-50"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                            className="rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                          />
                          Currently working here
                        </label>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                          placeholder="Describe your responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {profileData.experience.length === 0 && (
                  <div className="text-center py-8 text-stone-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                    <p>No work experience added yet</p>
                    <button
                      onClick={addExperience}
                      className="mt-3 text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Add your first experience
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {activeSection === 'education' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-stone-900">Education</h2>
                </div>
                <button
                  onClick={addEducation}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Education
                </button>
              </div>
              
              <div className="space-y-4">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="border border-stone-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-stone-900">Education</h3>
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">School</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          placeholder="University Name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          placeholder="Bachelor's, Master's, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          placeholder="Computer Science, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">GPA</label>
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          placeholder="3.8"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Start Date</label>
                        <input
                          type="month"
                          value={edu.start_date}
                          onChange={(e) => updateEducation(edu.id, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">End Date</label>
                        <input
                          type="month"
                          value={edu.end_date}
                          onChange={(e) => updateEducation(edu.id, 'end_date', e.target.value)}
                          disabled={edu.current}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors disabled:bg-stone-50"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1">
                          <input
                            type="checkbox"
                            checked={edu.current}
                            onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                            className="rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                          />
                          Currently studying here
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                
                {profileData.education.length === 0 && (
                  <div className="text-center py-8 text-stone-500">
                    <GraduationCap className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                    <p>No education added yet</p>
                    <button
                      onClick={addEducation}
                      className="mt-3 text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Add your education
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {activeSection === 'skills' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-stone-900">Skills</h2>
                </div>
                <button
                  onClick={addSkill}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Skill
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {profileData.skills.length === 0 && (
                  <div className="text-center py-8 text-stone-500 w-full">
                    <Award className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                    <p>No skills added yet</p>
                    <button
                      onClick={addSkill}
                      className="mt-3 text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Add your first skill
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Achievements */}
          {activeSection === 'achievements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-stone-900">Achievements</h2>
                </div>
                <button
                  onClick={addAchievement}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Achievement
                </button>
              </div>
              
              <div className="space-y-4">
                {profileData.achievements.map((achievement) => (
                  <div key={achievement.id} className="border border-stone-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-stone-900">Achievement</h3>
                      <button
                        onClick={() => removeAchievement(achievement.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={achievement.title}
                          onChange={(e) => updateAchievement(achievement.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          placeholder="Achievement Title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
                        <input
                          type="month"
                          value={achievement.date}
                          onChange={(e) => updateAchievement(achievement.id, 'date', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                        <textarea
                          value={achievement.description}
                          onChange={(e) => updateAchievement(achievement.id, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                          placeholder="Describe your achievement..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {profileData.achievements.length === 0 && (
                  <div className="text-center py-8 text-stone-500">
                    <Award className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                    <p>No achievements added yet</p>
                    <button
                      onClick={addAchievement}
                      className="mt-3 text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Add your first achievement
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Preview Component
function ProfilePreview({ profileData, onBack }) {
  const { personal, experience, education, skills, achievements } = profileData;

  return (
    <div className="min-h-screen bg-bridge-page">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Resume Preview</h1>
            <p className="text-stone-600">This is how mentors will see your profile</p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        {/* Resume Content */}
        <div className="bg-white rounded-2xl shadow-bridge-card overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">{personal.full_name || 'Your Name'}</h2>
            <p className="text-lg opacity-90 mb-4">{personal.title || 'Professional Title'}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {personal.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {personal.email}
                </div>
              )}
              {personal.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {personal.phone}
                </div>
              )}
              {personal.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {personal.location}
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Bio */}
            {personal.bio && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-3">About</h3>
                <p className="text-stone-600 leading-relaxed">{personal.bio}</p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">Work Experience</h3>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-orange-200 pl-4">
                      <h4 className="font-semibold text-stone-900">{exp.position}</h4>
                      <p className="text-stone-600">{exp.company}</p>
                      <p className="text-sm text-stone-500 mb-2">
                        {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} - 
                        {exp.current ? ' Present' : exp.end_date && new Date(exp.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </p>
                      {exp.description && (
                        <p className="text-stone-600 text-sm">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">Education</h3>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-orange-200 pl-4">
                      <h4 className="font-semibold text-stone-900">{edu.degree} in {edu.field}</h4>
                      <p className="text-stone-600">{edu.school}</p>
                      <p className="text-sm text-stone-500">
                        {edu.start_date && new Date(edu.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} - 
                        {edu.current ? ' Present' : edu.end_date && new Date(edu.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        {edu.gpa && ` | GPA: ${edu.gpa}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">Achievements</h3>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="border-l-2 border-orange-200 pl-4">
                      <h4 className="font-semibold text-stone-900">{achievement.title}</h4>
                      <p className="text-sm text-stone-500 mb-1">
                        {achievement.date && new Date(achievement.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </p>
                      {achievement.description && (
                        <p className="text-stone-600 text-sm">{achievement.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(personal.website || personal.linkedin || personal.github) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">Links</h3>
                <div className="flex flex-wrap gap-4">
                  {personal.website && (
                    <a href={personal.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                  {personal.linkedin && (
                    <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {personal.github && (
                    <a href={personal.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
