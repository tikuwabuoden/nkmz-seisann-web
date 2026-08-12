import type { Id, Settlement } from "@/domain/types";
import { emptyGroup, emptySettlement, sampleGroup, sampleSettlement } from "@/domain/test-data";
import { ApiError } from "@/lib/api-client";

export interface SettlementClient {
  get(groupId: Id): Promise<Settlement>;
}

function cloneSettlement(settlement: Settlement): Settlement {
  return {
    ...settlement,
    participants: settlement.participants.map((participant) => ({ ...participant })),
    transfers: settlement.transfers.map((transfer) => ({ ...transfer })),
  };
}

/** #28 で実 API クライアントに差し替えるまで使用する精算結果取得のモック。 */
export function createMockSettlementClient(
  initialSettlements: Record<Id, Settlement> = {
    [sampleGroup.id]: sampleSettlement,
    [emptyGroup.id]: emptySettlement,
  },
): SettlementClient {
  const settlementsByGroup = new Map(
    Object.entries(initialSettlements).map(([groupId, settlement]) => [groupId, cloneSettlement(settlement)]),
  );

  return {
    async get(groupId) {
      const settlement = settlementsByGroup.get(groupId);

      if (!settlement) {
        throw new ApiError(404, "Not Found");
      }

      return cloneSettlement(settlement);
    },
  };
}

export const settlementClient = createMockSettlementClient();
