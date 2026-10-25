import { useEffect, useState } from "react";
import api, { inr, fd } from "../services/api";
import DocLayout from "../components/DocLayout";

const DECL =
  "I confirm these bills are genuine, relate to this business trip, and have not been claimed elsewhere.";

const S = ({ children }) => <strong>{children}</strong>;

const names = (items = []) =>
  items.map((item, index) => (
    <span key={item}>
      {index > 0 && (index === items.length - 1 ? " and " : ", ")}
      <S>{item}</S>
    </span>
  ));

export default function PolicyDocument() {
  const [list, setList] = useState(null);
  const [bad, setBad] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .get("/policies")
      .then((response) => {
        if (active) setList(response.data);
      })
      .catch(() => {
        if (active) setBad(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (bad) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-navy mb-3">
          Travel and expense policy
        </h1>
        <p className="text-muted">
          Couldn't load the policy. Please refresh and try again.
        </p>
      </div>
    );
  }

  if (!list) {
    return <p className="text-muted">Loading travel and expense policy...</p>;
  }

  const updated = list
    .map((policy) => policy.updatedAt)
    .filter(Boolean)
    .sort()
    .pop();

  if (list.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-navy mb-3">
          Travel and expense policy
        </h1>
        <p className="text-muted mb-4">
          No expense category rules have been published yet. Please contact
          your administrator.
        </p>
      </div>
    );
  }

  const catBody = (policy) => (
    <>
      <p>
        You can claim up to <S>{inr(policy.maxAmount)}</S> per item in this
        category.
      </p>

      <ul>
        <li>
          <S>Spending limit.</S> Items above {inr(policy.maxAmount)} are
          flagged for your reviewer and may be reduced or rejected.
        </li>

        <li>
          <S>Documents.</S>{" "}
          {policy.requiredDocs?.length ? (
            <>
              Attach {names(policy.requiredDocs)}.{" "}
              {policy.receiptRequired ? "A receipt is required." : ""}
            </>
          ) : policy.receiptRequired ? (
            <>A receipt is <S>required</S>.</>
          ) : (
            <>
              A receipt is not required, but please attach one whenever you
              have it.
            </>
          )}
        </li>

        {policy.extraProofAbove > 0 && (
          <li>
            <S>Larger items.</S> Items above {inr(policy.extraProofAbove)} also
            need a <S>Supporting document</S>, for example an approval email
            or booking confirmation.
          </li>
        )}

        <li>
          <S>Missing receipts.</S>{" "}
          {policy.noReceiptLimit > 0 ? (
            <>
              If you genuinely have no receipt, you may declare it missing for
              items up to <S>{inr(policy.noReceiptLimit)}</S> and explain why.
              Your reviewer will see this clearly marked.
            </>
          ) : (
            <>
              A missing-receipt declaration is <S>not allowed</S> in this
              category.
            </>
          )}
        </li>

        {policy.requiresPreApproval && (
          <li>
            <S>Pre-approval.</S> Your trip must be approved before you can
            claim expenses in this category.
          </li>
        )}
      </ul>
    </>
  );

  const sections = [
    {
      id: "scope",
      title: "Who this policy applies to",
      body: (
        <>
          <p>
            This policy applies to every employee who travels on company
            business or pays for a work-related expense and asks to be
            reimbursed through Meridian. It explains what you can claim, what
            proof you need to provide, and how your claim is checked and
            approved.
          </p>
          <p>
            Meridian applies these rules automatically when you submit a claim,
            so you will see straight away if something is missing.
          </p>
        </>
      ),
    },
    {
      id: "process",
      title: "How a claim is approved",
      body: (
        <ol>
          <li>
            <S>Request the trip.</S> Submit a travel request with the
            destination, dates, purpose and estimated cost. Your manager
            approves it, returns it for changes, or rejects it.
          </li>
          <li>
            <S>Travel.</S> After the trip, mark it as completed.
          </li>
          <li>
            <S>Claim your expenses.</S> Add each expense with its bill details
            and documents, then confirm the declaration and submit.
          </li>
          <li>
            <S>Automatic checks.</S> Meridian compares your claim with the
            rules below.
          </li>
          <li>
            <S>Manager review.</S> Your manager verifies each bill, rejects it,
            or asks you for more proof.
          </li>
          <li>
            <S>Finance review and payment.</S> Finance approves the verified
            amount and records the payment.
          </li>
        </ol>
      ),
    },
    {
      id: "checks",
      title: "What is checked automatically",
      body: (
        <>
          <p>
            As soon as you submit a claim, the system looks for the following
            and flags anything unusual for your reviewers:
          </p>
          <ul>
            <li><S>Spending limits</S> for each category.</li>
            <li>
              <S>Required documents</S>, such as an invoice or boarding pass.
            </li>
            <li>
              <S>Dates.</S> The expense and bill dates must fall within the
              approved trip.
            </li>
            <li>
              <S>Bill details.</S> The amount on the bill must match the amount
              you claim.
            </li>
            <li>
              <S>Duplicates.</S> The same invoice number, receipt file, or
              expense claimed twice.
            </li>
            <li>
              <S>Pre-approval</S> where a category requires an approved trip
              first.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "categories",
      title: "Rules for each category",
      body: (
        <>
          <p>
            The table gives a quick overview. The details for each category
            follow below it.
          </p>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Limit per item</th>
                  <th>Receipt</th>
                  <th>Required documents</th>
                  <th>Pre-approval</th>
                </tr>
              </thead>
              <tbody>
                {list.map((policy) => (
                  <tr key={policy._id}>
                    <td><S>{policy.category}</S></td>
                    <td>{inr(policy.maxAmount)}</td>
                    <td>
                      {policy.receiptRequired ? "Required" : "Optional"}
                    </td>
                    <td>
                      {policy.requiredDocs?.length
                        ? policy.requiredDocs.join(", ")
                        : "None"}
                    </td>
                    <td>
                      {policy.requiresPreApproval ? "Needed" : "Not needed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {list.map((policy) => (
            <div key={policy._id}>
              <h3>{policy.category}</h3>
              {catBody(policy)}
            </div>
          ))}
        </>
      ),
    },
    {
      id: "declaration",
      title: "Your declaration",
      body: (
        <>
          <p>Every claim must be submitted with this confirmation:</p>
          <p><em>“{DECL}”</em></p>
          <p>
            Your name and the time you confirm it are saved with the claim.
            Submitting false, altered or duplicated documents may lead to the
            claim being rejected and to further action under your company's
            policies.
          </p>
        </>
      ),
    },
    {
      id: "review",
      title: "What reviewers do",
      body: (
        <>
          <p>
            Your manager and finance team look at each bill and mark it in one
            of three ways:
          </p>
          <ul>
            <li><S>Verified.</S> The bill is accepted.</li>
            <li>
              <S>Rejected.</S> The bill is not accepted, and the reviewer gives
              a reason. Rejected items are left out of the amount that is paid.
            </li>
            <li>
              <S>Needs more proof.</S> The claim comes back to you with a note
              about what is missing. Upload the documents and it returns to the
              same reviewer.
            </li>
          </ul>
          <p>
            You are reimbursed the <S>verified amount</S>, which can be lower
            than the amount you claimed.
          </p>
        </>
      ),
    },
    {
      id: "help",
      title: "Questions about this policy",
      body: (
        <p>
          If something here is unclear, or a rule does not fit your situation,
          speak to your manager or your administrator before you submit the
          claim.
        </p>
      ),
    },
  ];

  return (
    <DocLayout
      title="Travel and expense policy"
      updated={updated ? fd(updated) : null}
      sections={sections}
      intro={
        <p>
          This policy explains what you can claim when you travel for work,
          what proof you need, and how your claims are reviewed and paid. Read
          it before you submit a travel request or an expense claim.
        </p>
      }
      side={
        <p className="text-muted">
          Questions? Ask your manager or administrator.
        </p>
      }
    />
  );
}
