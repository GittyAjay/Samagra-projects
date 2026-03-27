import { defineEventHandler, readBody } from "h3";

import type { Lead, LeadTaskType, UserProfile } from "../../server/types/domain";
import { executeLeadAutoAssign } from "../../server/utils/lead-auto-assign.service";
import { normalizeEmail, normalizePhone } from "../../server/utils/auth";
import { requireFields } from "../../server/utils/http";
import { notifyUser } from "../../server/utils/notifications";
import { createId, listCollection, nowIso, setItem } from "../../server/utils/storage";

const TASK_TYPES: LeadTaskType[] = ["sales", "survey", "installation", "general"];

export default defineEventHandler(async (event) => {
  const body = await readBody<
    Partial<Lead> & {
      clientId?: string;
      fullName?: string;
      email?: string;
    }
  >(event);
  requireFields(body, ["monthlyElectricityBill", "requiredLoadKw", "roofType", "address", "phone"]);

  const timestamp = nowIso();
  const taskType =
    body.taskType && TASK_TYPES.includes(body.taskType as LeadTaskType)
      ? (body.taskType as LeadTaskType)
      : undefined;
  const users = await listCollection<UserProfile>("users");

  let clientId = String(body.clientId ?? "").trim();
  const normalizedPhone = normalizePhone(String(body.phone ?? ""));
  const normalizedEmail = body.email ? normalizeEmail(String(body.email)) : "";

  if (!clientId) {
    requireFields(body, ["fullName", "email"]);

    const existingClient =
      users.find((user) => user.role === "client" && user.email.toLowerCase() === normalizedEmail) ||
      users.find((user) => user.role === "client" && normalizePhone(user.phone) === normalizedPhone);

    if (existingClient) {
      clientId = existingClient.id;

      if (existingClient.email !== normalizedEmail || existingClient.phone !== normalizedPhone) {
        await setItem("users", {
          ...existingClient,
          email: normalizedEmail || existingClient.email,
          phone: normalizedPhone || existingClient.phone,
          updatedAt: timestamp
        });
      }
    } else {
      const newClient: UserProfile = {
        id: createId("user"),
        role: "client",
        fullName: String(body.fullName ?? "").trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password: `lead_${Math.random().toString(36).slice(2, 10)}`,
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      await setItem("users", newClient);
      users.push(newClient);
      clientId = newClient.id;
    }
  }

  const lead: Lead = {
    id: createId("lead"),
    clientId,
    source: body.source ?? (body.email ? "landing_page" : "client_app"),
    monthlyElectricityBill: Number(body.monthlyElectricityBill),
    requiredLoadKw: Number(body.requiredLoadKw),
    roofType: body.roofType as string,
    address: body.address as string,
    phone: normalizedPhone || (body.phone as string),
    notes: body.notes,
    interestedProductId: body.interestedProductId,
    documents: body.documents ?? [],
    status: "new",
    taskType,
    assignedStaffId: body.assignedStaffId,
    internalNotes: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await setItem("leads", lead);

  let resultLead = lead;
  let autoAssigned = false;

  if (!lead.assignedStaffId) {
    const auto = await executeLeadAutoAssign(lead, { force: false });
    if (auto.ok) {
      resultLead = auto.lead;
      autoAssigned = true;
    }
  }

  const client = users.find((user) => user.id === resultLead.clientId);
  const assignedStaff = resultLead.assignedStaffId
    ? users.find((user) => user.id === resultLead.assignedStaffId)
    : null;
  const admins = users.filter((user) => user.role === "admin" && user.active);

  if (client) {
    await notifyUser({
      userId: client.id,
      title: "Enquiry received",
      message: "We have received your enquiry and our team will get back to you soon.",
      type: "info",
      emailSubject: "We received your enquiry",
      emailText:
        `Hi ${client.fullName},\n\nWe have received your enquiry (${resultLead.id}). ` +
        "Our team is reviewing it and will get back to you soon.",
      emailHtml:
        `<div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">` +
        `<p>Hi ${client.fullName},</p>` +
        `<p>We have received your enquiry <strong>${resultLead.id}</strong>.</p>` +
        `<p>Our team is reviewing it and will get back to you soon.</p>` +
        `</div>`
    });
  }

  if (assignedStaff) {
    await notifyUser({
      userId: assignedStaff.id,
      title: "New enquiry assigned",
      message: `A new enquiry ${resultLead.id} has been assigned to you.`,
      type: "action",
      emailSubject: "New client enquiry assigned",
      emailText:
        `Hello ${assignedStaff.fullName},\n\nA new enquiry (${resultLead.id}) has been assigned to you. ` +
        "Please review the details and contact the client soon.",
      emailHtml:
        `<div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">` +
        `<p>Hello ${assignedStaff.fullName},</p>` +
        `<p>A new enquiry <strong>${resultLead.id}</strong> has been assigned to you.</p>` +
        `<p>Please review the details and contact the client soon.</p>` +
        `</div>`
    });
  }

  await Promise.all(
    admins.map((admin) =>
      notifyUser({
        userId: admin.id,
        title: "New enquiry received",
        message: `New enquiry ${resultLead.id} has been submitted${assignedStaff ? ` and assigned to ${assignedStaff.fullName}` : ""}.`,
        type: "info",
        emailSubject: "New enquiry received in Samagra",
        emailText:
          `A new enquiry (${resultLead.id}) has been submitted by ${client?.fullName || "a client"}.` +
          `${assignedStaff ? ` It has been assigned to ${assignedStaff.fullName}.` : " It is waiting for assignment."}`,
        emailHtml:
          `<div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">` +
          `<p>A new enquiry <strong>${resultLead.id}</strong> has been submitted by ${client?.fullName || "a client"}.</p>` +
          `<p>${assignedStaff ? `It has been assigned to <strong>${assignedStaff.fullName}</strong>.` : "It is waiting for assignment."}</p>` +
          `</div>`
      })
    )
  );

  return {
    message: autoAssigned
      ? "Inquiry submitted and assigned to a team member automatically."
      : "Inquiry submitted successfully",
    lead: resultLead,
    autoAssigned
  };
});
