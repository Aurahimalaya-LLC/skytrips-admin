import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { CompanyProfile } from "@/types/company";

import type { Address, ContactMethod, PhoneNumber } from "@/types/company";

type CompanyRow = {
  id: string;
  name: string;
  address?: Partial<Address> | string | null;
  emails?: Array<string | ContactMethod> | null;
  phones?: Array<string | PhoneNumber> | null;
  website?: string;
  operating_hours?: string;
  is_headquarters?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

function normalizeAddress(addr: CompanyRow["address"]): Address {
  if (addr && typeof addr === "object") {
    return {
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "",
      additionalInfo: addr.additionalInfo,
    };
  }
  return {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  };
}

function normalizeEmails(arr: CompanyRow["emails"]): ContactMethod[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((e, idx) =>
    typeof e === "string"
      ? { id: String(idx), label: "email", value: e }
      : e
  );
}

function normalizePhones(arr: CompanyRow["phones"]): PhoneNumber[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((p, idx) =>
    typeof p === "string"
      ? { id: String(idx), label: "phone", value: p }
      : p
  );
}

const supabaseAdmin = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey || env.supabase.anonKey,
);

export async function GET() {
  try {
    // 1. Fetch settings
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      return NextResponse.json(
        { error: settingsError.message },
        { status: 500 },
      );
    }

    // 2. Fetch live companies
    const { data: companiesData, error: companiesError } = await supabaseAdmin
      .from("companies")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (companiesError) {
      console.error("Error fetching companies:", companiesError);
      // We don't fail here, just log it. We can fallback to settingsData.company_profiles if needed,
      // or return empty array.
    }

    // Map companies to CompanyProfile
    const liveCompanyProfiles: CompanyProfile[] = (companiesData || []).map(
      (item: CompanyRow) => ({
        id: item.id,
        name: item.name,
        address: normalizeAddress(item.address),
        emails: normalizeEmails(item.emails),
        phones: normalizePhones(item.phones),
        website: item.website,
        operatingHours: item.operating_hours,
        isHeadquarters: item.is_headquarters,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        deletedAt: item.deleted_at || undefined,
      }),
    );

    // Return defaults if no settings found, but include live companies
    if (!settingsData) {
      return NextResponse.json({
        company_name: "Curent",
        company_email: "",
        company_phone: "",
        currency: "USD",
        date_format: "MM/DD/YYYY",
        notifications: true,
        logo_url: "",
        favicon_url: "",
        hero_headline: "",
        hero_subtitle: "",
        featured_image: "",
        seo_title: "",
        meta_description: "",
        faqs: [],
        domain_routing: {
          enabled: false,
          mappings: [
            { region: "Nepal", domain: "skytrips.com.np", countryCode: "NP" },
            { region: "Australia", domain: "skytrips.com.au", countryCode: "AU" },
          ],
          fallbackDomain: "skytripsworld.com",
        },
        company_profiles: liveCompanyProfiles,
      });
    }

    // Return settings with live companies
    return NextResponse.json({
      ...settingsData,
      hero_headline: settingsData.hero_headline || "",
      hero_subtitle: settingsData.hero_subtitle || "",
      featured_image: settingsData.featured_image || "",
      seo_title: settingsData.seo_title || "",
      meta_description: settingsData.meta_description || "",
      faqs: Array.isArray(settingsData.faqs) ? settingsData.faqs : [],
      domain_routing: settingsData.domain_routing || {
        enabled: false,
        mappings: [
          { region: "Nepal", domain: "skytrips.com.np", countryCode: "NP" },
          { region: "Australia", domain: "skytrips.com.au", countryCode: "AU" },
        ],
        fallbackDomain: "skytripsworld.com",
      },
      company_profiles: liveCompanyProfiles,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Fetch current companies from 'companies' table for snapshot
    const { data: companiesData, error: companiesError } = await supabaseAdmin
      .from("companies")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (companiesError) {
      console.error("Error fetching companies for snapshot:", companiesError);
      return NextResponse.json(
        { error: companiesError.message },
        { status: 500 },
      );
    }

    // Map to CompanyProfile
    const companyProfiles: CompanyProfile[] = (companiesData || []).map(
      (item: CompanyRow) => ({
        id: item.id,
        name: item.name,
        address: normalizeAddress(item.address),
        emails: normalizeEmails(item.emails),
        phones: normalizePhones(item.phones),
        website: item.website,
        operatingHours: item.operating_hours,
        isHeadquarters: item.is_headquarters,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        deletedAt: item.deleted_at || undefined,
      }),
    );

    // 2. Upsert settings with snapshot
    const { data: existing } = await supabaseAdmin
      .from("settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    const payload = {
      ...body,
      company_profiles: companyProfiles, // Save snapshot
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existing) {
      result = await supabaseAdmin
        .from("settings")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from("settings")
        .insert([payload])
        .select()
        .single();
    }

    if (result.error) {
      console.error("Error saving settings:", result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(result.data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in POST /api/settings:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
