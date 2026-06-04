"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AuthSession } from "@/lib/auth";

interface OnboardingFormProps {
  session: AuthSession;
}

export default function OnboardingForm({ session }: OnboardingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Client Onboarding Form State
  const [clientForm, setClientForm] = useState({
    name: "",
    organizationType: "GOVERNMENT",
    departmentOrIndustry: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    logoUrl: "",
  });

  // Contractor Onboarding Form State
  const [contractorForm, setContractorForm] = useState({
    businessName: "",
    description: "",
    tradeCategories: "", // comma separated
    skills: "", // comma separated
    serviceLocations: "", // comma separated
    yearsOfExperience: 1,
    profileImageUrl: "",
  });

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.organizationType) {
      toast.error("Please fill in the organization name and type.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientForm.name,
          organizationType: clientForm.organizationType,
          departmentOrIndustry: clientForm.departmentOrIndustry,
          phone: clientForm.phone,
          address: {
            street: clientForm.street,
            city: clientForm.city,
            state: clientForm.state,
            postalCode: clientForm.postalCode,
            country: clientForm.country,
          },
          logoUrl: clientForm.logoUrl || "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Client onboarding completed!");
        router.push("/dashboard/client");
        router.refresh();
      } else {
        toast.error(data.message || "Onboarding failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during onboarding.");
    } finally {
      setLoading(false);
    }
  };

  const handleContractorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorForm.businessName || !contractorForm.description || !contractorForm.yearsOfExperience) {
      toast.error("Please fill in the business name, description, and years of experience.");
      return;
    }

    setLoading(true);
    try {
      const tradeArr = contractorForm.tradeCategories.split(",").map((s) => s.trim()).filter(Boolean);
      const skillsArr = contractorForm.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const locationsArr = contractorForm.serviceLocations.split(",").map((s) => s.trim()).filter(Boolean);

      const res = await fetch("/api/auth/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: contractorForm.businessName,
          description: contractorForm.description,
          tradeCategories: tradeArr,
          skills: skillsArr,
          serviceLocations: locationsArr,
          yearsOfExperience: Number(contractorForm.yearsOfExperience),
          profileImageUrl: contractorForm.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Contractor onboarding completed!");
        router.push("/dashboard/contractor");
        router.refresh();
      } else {
        toast.error(data.message || "Onboarding failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {session.role === "CLIENT" ? (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Client Profile Onboarding</CardTitle>
            <CardDescription className="text-xs">
              Complete your organization details to start publishing projects.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleClientSubmit}>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name *</label>
                <Input
                  required
                  placeholder="e.g. City Public Works"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Type *</label>
                <Select
                  value={clientForm.organizationType}
                  onValueChange={(val: any) => setClientForm({ ...clientForm, organizationType: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOVERNMENT">Government Department</SelectItem>
                    <SelectItem value="PRIVATE_CUSTOMER">Private Customer / Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Industry</label>
                  <Input
                    placeholder="e.g. Infrastructure, Roads"
                    value={clientForm.departmentOrIndustry}
                    onChange={(e) => setClientForm({ ...clientForm, departmentOrIndustry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <Input
                    placeholder="e.g. 512-555-0100"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Address Details</h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Street Address</label>
                  <Input
                    placeholder="e.g. 123 Congress Ave"
                    value={clientForm.street}
                    onChange={(e) => setClientForm({ ...clientForm, street: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">City</label>
                    <Input
                      placeholder="e.g. Austin"
                      value={clientForm.city}
                      onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">State / Province</label>
                    <Input
                      placeholder="e.g. Texas"
                      value={clientForm.state}
                      onChange={(e) => setClientForm({ ...clientForm, state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Postal Code</label>
                    <Input
                      placeholder="e.g. 78701"
                      value={clientForm.postalCode}
                      onChange={(e) => setClientForm({ ...clientForm, postalCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Country</label>
                    <Input
                      placeholder="e.g. United States"
                      value={clientForm.country}
                      onChange={(e) => setClientForm({ ...clientForm, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Logo URL (Optional)</label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={clientForm.logoUrl}
                  onChange={(e) => setClientForm({ ...clientForm, logoUrl: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-lg text-sm">
                {loading ? "Saving Profile..." : "Complete Client Onboarding"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Contractor Profile Onboarding</CardTitle>
            <CardDescription className="text-xs">
              Complete your service portfolio to start bidding and accepting projects.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleContractorSubmit}>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name *</label>
                <Input
                  required
                  placeholder="e.g. Lone Star Asphalt Repairs"
                  value={contractorForm.businessName}
                  onChange={(e) => setContractorForm({ ...contractorForm, businessName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Description *</label>
                <Textarea
                  required
                  placeholder="Provide a bio of your company's expertise..."
                  rows={4}
                  value={contractorForm.description}
                  onChange={(e) => setContractorForm({ ...contractorForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trade Categories</label>
                <Input
                  placeholder="e.g. Asphalt Repair, Concrete Paving (comma separated)"
                  value={contractorForm.tradeCategories}
                  onChange={(e) => setContractorForm({ ...contractorForm, tradeCategories: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills</label>
                <Input
                  placeholder="e.g. Road patching, Resurfacing, Layout lining (comma separated)"
                  value={contractorForm.skills}
                  onChange={(e) => setContractorForm({ ...contractorForm, skills: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Locations</label>
                  <Input
                    placeholder="e.g. Austin TX, Round Rock TX (comma separated)"
                    value={contractorForm.serviceLocations}
                    onChange={(e) => setContractorForm({ ...contractorForm, serviceLocations: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience *</label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={contractorForm.yearsOfExperience}
                    onChange={(e) => setContractorForm({ ...contractorForm, yearsOfExperience: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Image / Business Logo URL</label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={contractorForm.profileImageUrl}
                  onChange={(e) => setContractorForm({ ...contractorForm, profileImageUrl: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-lg text-sm">
                {loading ? "Saving Profile..." : "Complete Contractor Onboarding"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
