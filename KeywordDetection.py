from dataclasses import dataclass, asdict
from typing import Dict, List, Iterable, Tuple, Optional
from pathlib import Path

@dataclass
class Match:
    keyword: str
    line_number: int
    start_index: int
    end_index: int
    context: str

@dataclass
class FileScanResult:
    file_path: str
    total_matches: int
    keyword_counts: Dict[str, int]
    matches: List[Match]

class RabinKarpKeywordScanner:
    def __init__(
        self,
        base: int = 256,
        modulus: int = 10**9 + 7,
        case_sensitive: bool = False,
    ):
        self.base = base
        self.modulus = modulus
        self.case_sensitive = case_sensitive

        self._patterns_by_len: Dict[int, Dict[int, List[str]]] = {}
        self._pattern_set: set[str] = set()

    def _normalize(self, s: str) -> str:
        return s if self.case_sensitive else s.lower()

    def add_keywords(self, keywords: Iterable[str]) -> None:
        for kw in keywords:
            kw = kw.strip()
            if not kw:
                continue
            norm_kw = self._normalize(kw)
            if norm_kw in self._pattern_set:
                continue

            self._pattern_set.add(norm_kw)
            length = len(norm_kw)
            h = self._hash_string(norm_kw)
            length_bucket = self._patterns_by_len.setdefault(length, {})
            length_bucket.setdefault(h, []).append(norm_kw)

    def add_keywords_from_file(self, path: str | Path) -> None:
        path = Path(path)
        with path.open("r", encoding="utf-8") as f:
            self.add_keywords(f.readlines())

    def _hash_string(self, s: str) -> int:
        h = 0
        for ch in s:
            h = (h * self.base + ord(ch)) % self.modulus
        return h

    def _recompute_rolling_hash(
        self, prev_hash: int, left_char: str, right_char: str, highest_power: int
    ) -> int:

        h = prev_hash
        h = (h - ord(left_char) * highest_power) % self.modulus
        h = (h * self.base + ord(right_char)) % self.modulus
        return h

    def scan_text(self, text: str) -> List[Match]:
        matches: List[Match] = []
        lines = text.splitlines()

        highest_powers: Dict[int, int] = {
            length: pow(self.base, length - 1, self.modulus)
            for length in self._patterns_by_len.keys()
        }

        for line_idx, line in enumerate(lines, start=1):
            line_proc = self._normalize(line)
            n = len(line_proc)

            for length, hash_bucket in self._patterns_by_len.items():
                if n < length:
                    continue

                hp = highest_powers[length]

                window = line_proc[:length]
                window_hash = self._hash_string(window)

                self._maybe_record_matches(
                    line=line,
                    line_proc=line_proc,
                    line_number=line_idx,
                    start_index=0,
                    window_hash=window_hash,
                    hash_bucket=hash_bucket,
                    length=length,
                    out_matches=matches,
                )

                for start in range(1, n - length + 1):
                    window_hash = self._recompute_rolling_hash(
                        window_hash,
                        left_char=line_proc[start - 1],
                        right_char=line_proc[start + length - 1],
                        highest_power=hp,
                    )
                    self._maybe_record_matches(
                        line=line,
                        line_proc=line_proc,
                        line_number=line_idx,
                        start_index=start,
                        window_hash=window_hash,
                        hash_bucket=hash_bucket,
                        length=length,
                        out_matches=matches,
                    )

        return matches

    def _maybe_record_matches(
        self,
        line: str,
        line_proc: str,
        line_number: int,
        start_index: int,
        window_hash: int,
        hash_bucket: Dict[int, List[str]],
        length: int,
        out_matches: List[Match],
    ) -> None:
        candidate_patterns = hash_bucket.get(window_hash)
        if not candidate_patterns:
            return

        window_text = line_proc[start_index : start_index + length]

        for pattern in candidate_patterns:
            if window_text == pattern:
                match = Match(
                    keyword=pattern if self.case_sensitive else pattern,
                    line_number=line_number,
                    start_index=start_index,
                    end_index=start_index + length,
                    context=line,
                )
                out_matches.append(match)

    def scan_file(self, path: str | Path) -> FileScanResult:
        path = Path(path)
        with path.open("r", encoding="utf-8", errors="ignore") as f:
            text = f.read()

        matches = self.scan_text(text)

        keyword_counts: Dict[str, int] = {kw: 0 for kw in self._pattern_set}
        for m in matches:
            keyword_counts[self._normalize(m.keyword)] += 1

        total_matches = sum(keyword_counts.values())

        return FileScanResult(
            file_path=str(path),
            total_matches=total_matches,
            keyword_counts=keyword_counts,
            matches=matches,
        )

    def scan_files(self, paths: Iterable[str | Path]) -> Dict[str, FileScanResult]:
        results: Dict[str, FileScanResult] = {}
        for p in paths:
            res = self.scan_file(p)
            results[res.file_path] = res
        return results


def load_text_files_from_directory(
    directory: str | Path,
    extensions: Optional[Tuple[str, ...]] = (".txt",),
) -> List[Path]:
    directory = Path(directory)
    files: List[Path] = []
    for path in directory.rglob("*"):
        if path.is_file() and (extensions is None or path.suffix.lower() in extensions):
            files.append(path)
    return files


def summarize_results(results: Dict[str, FileScanResult]) -> Dict:
    summary_keyword_counts: Dict[str, int] = {}
    for file_res in results.values():
        for kw, count in file_res.keyword_counts.items():
            summary_keyword_counts[kw] = summary_keyword_counts.get(kw, 0) + count

    total_matches = sum(summary_keyword_counts.values())

    return {
        "total_matches": total_matches,
        "keyword_totals": summary_keyword_counts,
        "files": {
            path: {
                "total_matches": res.total_matches,
                "keyword_counts": res.keyword_counts,
                "matches": [asdict(m) for m in res.matches],
            }
            for path, res in results.items()
        },
    }



if __name__ == "__main__":
    """
    Example usage:
    - keyword file: keywords_finance.txt (one keyword per line)
    - directory of text files: ./sample_emails

    This block is just for quick testing; in a real app you would import the
    scanner and call its methods from your API or frontend handler.
    """

    import json

    keyword_file = "keywords_finance.txt"
    text_dir = "./sample_emails"

    scanner = RabinKarpKeywordScanner(case_sensitive=False)
    scanner.add_keywords_from_file(keyword_file)

    text_files = load_text_files_from_directory(text_dir, extensions=(".txt",))
    results = scanner.scan_files(text_files)

    summary = summarize_results(results)

    # Pretty-print JSON summary (easy for a frontend to consume)
    print(json.dumps(summary, indent=2, ensure_ascii=False))
