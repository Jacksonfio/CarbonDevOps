import React, { useState } from 'react';
import { Settings, Save, Key, ShieldCheck, Database, Layers, CheckCircle } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (s: SystemSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSaveSettings }) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1000px] mx-auto text-[#E0E0E0]">
      <div>
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tight">
          System Settings & Credentials
        </h2>
        <p className="font-body text-sm text-[#A1A1AA] mt-1">
          Configure AWS Secrets Manager, Electricity Maps API Key, SQS Queue URL, and Amazon S3 Reporting bucket.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-xl text-[#00FF41] font-semibold text-xs flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Configuration saved successfully! Threshold and API connections updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6 space-y-6 shadow-xs">
        <div>
          <h3 className="font-headline font-bold text-base text-white mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-[#00FF41]" />
            <span>Electricity Maps API Integration</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                API Key (Stored in AWS Secrets Manager)
              </label>
              <input
                type="password"
                value={formData.electricityApiKey}
                onChange={(e) => setFormData({ ...formData, electricityApiKey: e.target.value })}
                placeholder="YOUR_ELECTRICITY_MAPS_API_KEY"
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg text-xs font-code focus:outline-none focus:border-[#00FF41]"
              />
              <p className="text-[11px] text-[#71717A] mt-1">
                Headers sent: <code>auth-token: YOUR_ELECTRICITY_MAPS_API_KEY</code>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] pt-6">
          <h3 className="font-headline font-bold text-base text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00FF41]" />
            <span>Carbon Decision Threshold</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
              Global Threshold (gCO2eq/kWh)
            </label>
            <input
              type="number"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg text-xs font-code focus:outline-none focus:border-[#00FF41]"
            />
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] pt-6">
          <h3 className="font-headline font-bold text-base text-white mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00FF41]" />
            <span>AWS Infrastructure Endpoints</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Amazon SQS Queue URL
              </label>
              <input
                type="text"
                value={formData.sqsQueueUrl}
                onChange={(e) => setFormData({ ...formData, sqsQueueUrl: e.target.value })}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg text-xs font-code focus:outline-none focus:border-[#00FF41]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                Amazon S3 Sustainability Bucket
              </label>
              <input
                type="text"
                value={formData.s3BucketName}
                onChange={(e) => setFormData({ ...formData, s3BucketName: e.target.value })}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg text-xs font-code focus:outline-none focus:border-[#00FF41]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#00FF41] text-black rounded-xl font-headline text-xs font-bold hover:bg-[#00e038] transition-all flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
