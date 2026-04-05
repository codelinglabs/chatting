"use client";

import { useEffect, useState } from "react";
import type { ContactDetail, ContactStatusDefinition } from "@/lib/contact-types";
import { useToast } from "../ui/toast-provider";

type SaveContactOptions = {
  optimisticContact?: ContactDetail | null;
  previousContact?: ContactDetail | null;
};

export function useDashboardThreadContact(contactId: string | null) {
  const { showToast } = useToast();
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [contactStatuses, setContactStatuses] = useState<ContactStatusDefinition[]>([]);

  useEffect(() => {
    if (!contactId) {
      setContact(null);
      setContactStatuses([]);
      return;
    }

    let cancelled = false;
    void fetch(`/api/contacts/${encodeURIComponent(contactId)}?includeSettings=1`, {
      method: "GET",
      cache: "no-store"
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          ok: boolean;
          contact?: ContactDetail;
          settings?: { statuses: ContactStatusDefinition[] };
          error?: string;
        };
        if (!response.ok || !payload.ok || !payload.contact) {
          throw new Error(payload.error ?? "Unable to load contact.");
        }
        if (!cancelled) {
          setContact(payload.contact);
          setContactStatuses(payload.settings?.statuses ?? []);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setContact(null);
          setContactStatuses([]);
          showToast(
            "error",
            "We couldn't load contact memory.",
            error instanceof Error ? error.message : "Please try again in a moment."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [contactId, showToast]);

  async function saveContactPatch(
    payload: Record<string, unknown>,
    options?: SaveContactOptions
  ) {
    if (!contactId) {
      return;
    }

    const previousContact = options?.previousContact ?? contact;
    if (options?.optimisticContact) {
      setContact(options.optimisticContact);
    }

    try {
      const response = await fetch(`/api/contacts/${encodeURIComponent(contactId)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as {
        ok: boolean;
        contact?: ContactDetail;
        error?: string;
      };
      if (!response.ok || !result.ok || !result.contact) {
        throw new Error(result.error ?? "Unable to update contact.");
      }
      setContact(result.contact);
    } catch (error) {
      if (options?.optimisticContact && previousContact) {
        setContact(previousContact);
      }
      showToast(
        "error",
        "We couldn't update that contact.",
        error instanceof Error ? error.message : "Please try again in a moment."
      );
    }
  }

  return { contact, contactStatuses, saveContactPatch };
}
