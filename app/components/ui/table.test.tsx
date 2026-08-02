import { render, screen } from "@testing-library/react"

import { TableCell } from "./table"

describe("TableCell", () => {
  it("標準では内容の折り返しを許可する", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell>長いグループ名</TableCell>
          </tr>
        </tbody>
      </table>
    )

    expect(screen.getByRole("cell", { name: "長いグループ名" })).toHaveClass("break-words")
  })

  it("noWrapを指定すると内容を折り返さない", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell noWrap>12,000円</TableCell>
          </tr>
        </tbody>
      </table>
    )

    expect(screen.getByRole("cell", { name: "12,000円" })).toHaveClass("whitespace-nowrap")
  })
})
