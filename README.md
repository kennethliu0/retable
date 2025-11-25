# retable
A minimal Chrome extension adding filtering functionality to tables

## Quickstart

### Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked** and select the `retable` folder
5. The extension icon will appear in your toolbar

### Usage

1. Navigate to any webpage with a table you want to filter
2. Click the **Retable** extension icon in your toolbar
3. Click **Select Table**
4. Hover over tables on the page — they'll highlight in blue
5. Click the table you want to filter
6. A filter row appears below the header — type in any column to filter rows

### Filter Syntax

Filters support **regex patterns** (case-insensitive):

| Pattern | Matches |
|---------|---------|
| `hello` | cells containing "hello" |
| `^Start` | cells starting with "Start" |
| `end$` | cells ending with "end" |
| `foo\|bar` | cells containing "foo" OR "bar" |
| `\d+` | cells containing digits |
| `^[A-Z]{2}\d{4}$` | exactly 2 uppercase letters + 4 digits |

Invalid regex patterns will highlight the input in red.

### Tips

- Press **Escape** to cancel table selection
- Multiple column filters work together (AND logic)
- Filter inputs turn yellow when active