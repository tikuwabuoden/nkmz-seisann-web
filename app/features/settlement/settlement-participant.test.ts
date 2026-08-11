import { sampleGroup, users } from "@/domain/test-data";

import { createParticipantNameMap, findCurrentParticipant } from "./settlement-participant";

describe("精算結果の参加者対応", () => {
  it("ログインユーザーに対応する参加者を特定できる", () => {
    expect(findCurrentParticipant(sampleGroup.participants, users.alice.id)).toMatchObject({
      id: "participant-alice",
      username: "akira",
    });
  });

  it("参加していないユーザーにはnullを返す", () => {
    expect(findCurrentParticipant(sampleGroup.participants, "user-unknown")).toBeNull();
  });

  it("participantIdから参加者名を引ける", () => {
    const names = createParticipantNameMap(sampleGroup.participants);

    expect(names.get("participant-bob")).toBe("yu");
  });
});
