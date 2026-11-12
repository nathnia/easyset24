// POST /flights/prebooks: reserve the offer with the airline + get the Stripe payment keys
import { liteapi } from "../utils/liteapi-proxy";

const text = (v: unknown, max = 100) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const digits = (v: unknown, max: number) =>
  text(v, 40).replace(/\D/g, "").slice(0, max);
const bad = (message: string) =>
  createError({ statusCode: 400, statusMessage: message });
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO2 = /^[A-Za-z]{2}$/;

export default defineEventHandler(async (event) => {
  const b = (await readBody(event)) ?? {};

  const offerId = text(b.offerId, 2000);
  if (!/^[A-Za-z0-9+/=_-]{10,2000}$/.test(offerId))
    throw bad("Invalid offerId");

  const c = b.contact ?? {};
  const contact = {
    firstName: text(c.firstName),
    lastName: text(c.lastName),
    ...(text(c.middleName) ? { middleName: text(c.middleName) } : {}),
    email: text(c.email, 200),
    phoneCountryCode: digits(c.phoneCountryCode, 4),
    phoneNumber: digits(c.phoneNumber, 15),
  };
  if (!contact.firstName || !contact.lastName)
    throw bad("Contact name is required");
  if (!/^\S+@\S+\.\S+$/.test(contact.email))
    throw bad("A valid email is required");
  if (!contact.phoneCountryCode || contact.phoneNumber.length < 6) {
    throw bad("A valid phone number is required");
  }

  if (
    !Array.isArray(b.passengers) ||
    b.passengers.length < 1 ||
    b.passengers.length > 9
  ) {
    throw bad("1 to 9 passengers are required");
  }
  const passengers = b.passengers.map((p: any, i: number) => {
    const n = i + 1;
    const passengerType = Number(p?.passengerType);
    const gender = text(p?.gender, 1).toUpperCase();
    if (![0, 1, 2].includes(passengerType))
      throw bad(`Passenger ${n}: invalid type`);
    if (!text(p?.firstName) || !text(p?.lastName))
      throw bad(`Passenger ${n}: name is required`);
    if (!DATE.test(text(p?.birthday, 10)))
      throw bad(`Passenger ${n}: invalid date of birth`);
    if (!["M", "F", "X"].includes(gender))
      throw bad(`Passenger ${n}: invalid gender`);
    if (!ISO2.test(text(p?.nationality, 2)))
      throw bad(`Passenger ${n}: invalid nationality`);

    const doc = text(p?.documentNumber, 30);
    const expiry = text(p?.documentExpiry, 10);
    const issue = text(p?.documentIssueCountry, 2);
    return {
      passengerType,
      firstName: text(p.firstName),
      ...(text(p.middleName) ? { middleName: text(p.middleName) } : {}),
      lastName: text(p.lastName),
      birthday: text(p.birthday, 10),
      gender,
      nationality: text(p.nationality, 2).toUpperCase(),
      ...(doc
        ? {
            documentType: "passport",
            documentNumber: doc,
            ...(ISO2.test(issue)
              ? { documentIssueCountry: issue.toUpperCase() }
              : {}),
            ...(DATE.test(expiry) ? { documentExpiry: expiry } : {}),
          }
        : {}),
    };
  });

  return liteapi(
    event,
    "/flights/prebooks",
    {},
    { body: { offerId, usePaymentSdk: true, contact, passengers } },
  );
});
