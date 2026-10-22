import math
from typing import Dict, Any, List

# Lookup tables from 1 PAGE sheet
HRA_TABLE_GRADE1 = [(13601.0, 300.0), (17201.0, 350.0), (21001.0, 400.0), (23901.0, 400.0), (27201.0, 450.0), (30601.0, 500.0), (35401.0, 550.0), (37301.0, 600.0), (41101.0, 650.0), (44501.0, 650.0), (50201.0, 700.0), (51601.0, 750.0), (54001.0, 800.0), (55501.0, 850.0), (56901.0, 850.0)]
HRA_TABLE_GRADE2 = [(13601.0, 450.0), (17201.0, 500.0), (21001.0, 700.0), (23901.0, 800.0), (27201.0, 1000.0), (30601.0, 1200.0), (35401.0, 1500.0), (37301.0, 1700.0), (41101.0, 1900.0), (44501.0, 2000.0), (50201.0, 2200.0), (51601.0, 2200.0), (54001.0, 2200.0), (55501.0, 2200.0), (56901.0, 2200.0)]
HRA_TABLE_GRADE3 = [(13601.0, 700.0), (17201.0, 800.0), (21001.0, 1000.0), (23901.0, 1200.0), (27201.0, 1500.0), (30601.0, 1700.0), (35401.0, 1800.0), (37301.0, 2300.0), (41101.0, 2600.0), (44501.0, 2900.0), (50201.0, 3100.0), (51601.0, 3200.0), (54001.0, 3200.0), (55501.0, 3200.0), (56901.0, 3200.0)]
HRA_TABLE_GRADE4 = [(13601.0, 1000.0), (17201.0, 1200.0), (21001.0, 1400.0), (23901.0, 1700.0), (27201.0, 2000.0), (30601.0, 2300.0), (35401.0, 2600.0), (37301.0, 3000.0), (41101.0, 3300.0), (44501.0, 3600.0), (50201.0, 3800.0), (51601.0, 4100.0), (54001.0, 4300.0), (55501.0, 4300.0), (56901.0, 4300.0)]
HRA_TABLE_GRADE5 = [(13601.0, 150.0), (17201.0, 1800.0), (21001.0, 2100.0), (23901.0, 2600.0), (27201.0, 3100.0), (30601.0, 3600.0), (35401.0, 4200.0), (37301.0, 4700.0), (41101.0, 5200.0), (44501.0, 5700.0), (50201.0, 6200.0), (51601.0, 6800.0), (54001.0, 7300.0), (55501.0, 7500.0), (56901.0, 7800.0), (64201.0, 8300.0)]

CCA_TABLE_NON_CHENNAI = [(20601.0, 260.0), (30801.0, 400.0), (41101.0, 720.0)]
CCA_TABLE_CHENNAI = [(0.0, 360.0), (20601.0, 500.0), (30801.0, 800.0), (41101.0, 1200.0)]

def vlookup_approx(val: float, table: List[tuple]) -> float:
    result = 0.0
    for threshold, rate in table:
        if val >= threshold:
            result = rate
        else:
            break
    return result

def get_hra_amount(basic_pay: float, hra_grade: int) -> float:
    if hra_grade == 1:
        return vlookup_approx(basic_pay, HRA_TABLE_GRADE1)
    elif hra_grade == 2:
        return vlookup_approx(basic_pay, HRA_TABLE_GRADE2)
    elif hra_grade == 3:
        return vlookup_approx(basic_pay, HRA_TABLE_GRADE3)
    elif hra_grade == 4:
        return vlookup_approx(basic_pay, HRA_TABLE_GRADE4)
    elif hra_grade == 5:
        return vlookup_approx(basic_pay, HRA_TABLE_GRADE5)
    return 0.0

def get_cca_amount(basic_pay: float, cca_grade: int) -> float:
    if cca_grade == 1: # Other than Chennai
        return vlookup_approx(basic_pay, CCA_TABLE_NON_CHENNAI)
    elif cca_grade == 2: # Chennai
        return vlookup_approx(basic_pay, CCA_TABLE_CHENNAI)
    return 0.0

def round_nearest_100(val: float) -> float:
    return round(val, -2)

def calculate_it_statement(input_data: Dict[str, Any]) -> Dict[str, Any]:
    name = str(input_data.get("name", "")).strip()
    sex = str(input_data.get("sex", "MALE")).strip().upper()
    designation = str(input_data.get("designation", "")).strip()
    pan_number = str(input_data.get("pan_number", "")).strip().upper()
    tan_number = str(input_data.get("tan_number", "")).strip().upper()
    phone = str(input_data.get("phone", "")).strip()
    whatsapp_number = str(input_data.get("whatsapp_number", phone)).strip()
    school_type = str(input_data.get("school_type", "")).strip()
    school_name = str(input_data.get("school_name", "")).strip()
    office_address = str(input_data.get("office_address", "")).strip()

    march_basic = float(input_data.get("basic_pay", 0) or 0)
    inc_month = int(input_data.get("increment_month", 0) or 0) # 0, 1, 4, 7, 10
    pp = float(input_data.get("pp", 0) or 0)
    bonus = float(input_data.get("bonus", 3000) or 3000)
    hra_grade = int(input_data.get("hra_grade", 1) or 1)
    cca_grade = int(input_data.get("cca_grade", 0) or 0)
    spl_transport = float(input_data.get("spl_transport_allowance", 0) or 0)
    surrender_month = int(input_data.get("surrender_month", 0) or 0)
    pp_surrender = float(input_data.get("pp_surrender", 0) or 0)
    sel_grade_pay = float(input_data.get("selection_grade_pay", 0) or 0)
    sel_grade_month = int(input_data.get("selection_grade_month", 0) or 0)
    strike_month = int(input_data.get("strike_month", 0) or 0)
    strike_days = float(input_data.get("strike_days", 0) or 0)

    # IT advance list (11 months: Mar 2025 to Jan 2026)
    adv_dict = input_data.get("it_advance_monthly", {}) or {}
    months_keys = ["mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec", "jan"]

    # Month definitions: (Month Name, Month Num, Year, DA %)
    months_def = [
        ("MAR - 2025", 3, 2025, 53.0, "mar"),
        ("APR - 2025", 4, 2025, 53.0, "apr"),
        ("MAY - 2025", 5, 2025, 55.0, "may"),
        ("JUN - 2025", 6, 2025, 55.0, "jun"),
        ("JUL - 2025", 7, 2025, 55.0, "jul"),
        ("AUG - 2025", 8, 2025, 55.0, "aug"),
        ("SEP - 2025", 9, 2025, 55.0, "sep"),
        ("OCT - 2025", 10, 2025, 55.0, "oct"),
        ("NOV - 2025", 11, 2025, 58.0, "nov"),
        ("DEC - 2025", 12, 2025, 58.0, "dec"),
        ("JAN - 2026", 1, 2026, 58.0, "jan"),
        ("FEB - 2026", 2, 2026, 58.0, "feb")
    ]

    # Calculate 3% increment on basic
    annual_increment = round_nearest_100(march_basic * 0.03)
    inc_basic = march_basic + annual_increment

    current_basic = march_basic
    monthly_rows = []

    for name_str, m_num, y_num, da_pct, k in months_def:
        # Check increment or selection grade application
        if sel_grade_month > 0 and sel_grade_pay > 0 and m_num == sel_grade_month:
            current_basic = sel_grade_pay
        elif inc_month > 0 and m_num == inc_month:
            current_basic = inc_basic

        m_basic = current_basic
        m_da = round(m_basic * (da_pct / 100.0))
        m_oa = pp
        m_hra = get_hra_amount(m_basic, hra_grade)
        m_cca = get_cca_amount(m_basic, cca_grade)
        m_ma = 300.0
        m_sa = spl_transport
        m_it_adv = float(adv_dict.get(k, 0) or 0)

        # Apply strike deduction if this is the strike month
        if strike_month > 0 and strike_days > 0 and m_num == strike_month:
            days_in_m = 31 # TN bills use standard 31 denominator
            ded_basic = round((m_basic / days_in_m) * strike_days)
            ded_da = round((m_da / days_in_m) * strike_days)
            ded_oa = round((m_oa / days_in_m) * strike_days)
            ded_hra = round((m_hra / days_in_m) * strike_days)
            ded_cca = round((m_cca / days_in_m) * strike_days)
            ded_ma = round((m_ma / days_in_m) * strike_days)
            ded_sa = round((m_sa / days_in_m) * strike_days)

            m_basic -= ded_basic
            m_da -= ded_da
            m_oa -= ded_oa
            m_hra -= ded_hra
            m_cca -= ded_cca
            m_ma -= ded_ma
            m_sa -= ded_sa

        m_gross = m_basic + m_da + m_oa + m_hra + m_cca + m_ma + m_sa

        monthly_rows.append({
            "month": name_str,
            "month_num": m_num,
            "year": y_num,
            "da_pct": da_pct,
            "basic": m_basic,
            "da": m_da,
            "oa": m_oa,
            "hra": m_hra,
            "cca": m_cca,
            "ma": m_ma,
            "sa": m_sa,
            "gross": m_gross,
            "it_advance": m_it_adv
        })

    # Monthly totals
    tot_basic = sum(r["basic"] for r in monthly_rows)
    tot_da = sum(r["da"] for r in monthly_rows)
    tot_oa = sum(r["oa"] for r in monthly_rows)
    tot_hra = sum(r["hra"] for r in monthly_rows)
    tot_cca = sum(r["cca"] for r in monthly_rows)
    tot_ma = sum(r["ma"] for r in monthly_rows)
    tot_sa = sum(r["sa"] for r in monthly_rows)
    tot_monthly_gross = sum(r["gross"] for r in monthly_rows)
    tot_it_advance = sum(r["it_advance"] for r in monthly_rows)

    # 1. DA Arrears 1 (March & April: diff between 55% and 53%)
    mar_row = monthly_rows[0]
    apr_row = monthly_rows[1]
    af19 = round(mar_row["basic"] * 0.55) - round(mar_row["basic"] * 0.53)
    af20 = round(apr_row["basic"] * 0.55) - round(apr_row["basic"] * 0.53)
    da_arrears_1 = (af19 * 3) + (af20 * 1)

    # 2. DA Arrears 2 (July to Oct: diff between 58% and 55%)
    jul_row = monthly_rows[4]
    oct_row = monthly_rows[7]
    af24 = round(jul_row["basic"] * 0.58) - round(jul_row["basic"] * 0.55)
    ag24 = af24 * 3 # Jul, Aug, Sep
    af25 = round(oct_row["basic"] * 0.58) - round(oct_row["basic"] * 0.55)
    ag25 = af25 * 1 # Oct
    da_arrears_2 = ag24 + ag25
    if surrender_month == 10:
        surrender_da_arr = round(ag25 / 2.0)
        da_arrears_2 += surrender_da_arr

    # 3. Surrender Leave Salary (15 days = Half Month pay)
    surrender_total = 0.0
    surrender_basic = 0.0
    surrender_da = 0.0
    surrender_oa = 0.0
    surrender_hra = 0.0
    surrender_cca = 0.0

    if surrender_month in [10, 11, 12, 1]:
        # Target month row
        surr_row = next((r for r in monthly_rows if r["month_num"] == surrender_month), monthly_rows[7])
        surrender_basic = round(surr_row["basic"] / 2.0)
        surrender_da = round(surr_row["da"] / 2.0)
        surrender_oa = round(surr_row["oa"] / 2.0)
        surrender_hra = round(surr_row["hra"] / 2.0)
        surrender_cca = round(surr_row["cca"] / 2.0)
        surrender_total = surrender_basic + surrender_da + surrender_oa + surrender_hra + surrender_cca

    # 4. Selection / Special Grade Arrears
    sel_grade_arr = float(input_data.get("selection_grade_arrears", 0) or 0)

    # Grand Gross Salary
    gross_salary = (
        tot_monthly_gross +
        bonus +
        da_arrears_1 +
        da_arrears_2 +
        surrender_total +
        sel_grade_arr
    )

    # Standard Deduction
    std_deduction = 75000.0
    # Specially abled transport allowance deduction = total transport allowance received
    spl_transport_deduction = tot_sa
    total_deduction = std_deduction + spl_transport_deduction

    # Taxable Salary Income
    taxable_income = max(0.0, gross_salary - total_deduction)

    # Tax Calculation Table 2 (New Tax Regime Slabs FY 2025-26)
    # Slab 1: 0 - 400000 : 0%
    # Slab 2: 400001 - 800000 : 5% (max 400000 @ 5% = 20000)
    # Slab 3: 800001 - 1200000 : 10% (max 400000 @ 10% = 40000)
    # Slab 4: 1200001 - 1600000 : 15% (max 400000 @ 15% = 60000)
    # Slab 5: 1600001 - 2000000 : 20% (max 400000 @ 20% = 80000)
    # Slab 6: 200001 - 2400000 : 25% (max 400000 @ 25% = 100000)
    # Slab 7: > 2400000 : 30%

    rem = taxable_income
    slab1_base = min(rem, 400000.0)
    slab1_tax = 0.0
    rem = max(0.0, rem - 400000.0)

    slab2_base = min(rem, 400000.0)
    slab2_tax = round(slab2_base * 0.05)
    rem = max(0.0, rem - 400000.0)

    slab3_base = min(rem, 400000.0)
    slab3_tax = round(slab3_base * 0.10)
    rem = max(0.0, rem - 400000.0)

    slab4_base = min(rem, 400000.0)
    slab4_tax = round(slab4_base * 0.15)
    rem = max(0.0, rem - 400000.0)

    slab5_base = min(rem, 400000.0)
    slab5_tax = round(slab5_base * 0.20)
    rem = max(0.0, rem - 400000.0)

    slab6_base = min(rem, 400000.0)
    slab6_tax = round(slab6_base * 0.25)
    rem = max(0.0, rem - 400000.0)

    slab7_base = rem
    slab7_tax = round(slab7_base * 0.30)

    total_tax_before_rebate = slab1_tax + slab2_tax + slab3_tax + slab4_tax + slab5_tax + slab6_tax + slab7_tax

    # Section 87A Rebate & Marginal Relief
    excess_over_12L = taxable_income - 1200000.0
    rebate_87a = 0.0
    marginal_relief_tax = 0.0
    tax_before_cess = 0.0

    if taxable_income <= 1200000.0:
        # Full rebate under 87A
        rebate_87a = total_tax_before_rebate
        tax_before_cess = 0.0
    elif excess_over_12L <= 70500.0:
        # Marginal relief applies
        marginal_relief_tax = excess_over_12L
        rebate_87a = max(0.0, total_tax_before_rebate - marginal_relief_tax)
        tax_before_cess = marginal_relief_tax
    else:
        # No rebate
        rebate_87a = 0.0
        tax_before_cess = total_tax_before_rebate

    # 4% Educational Cess
    cess_amount = round(tax_before_cess * 0.04) if tax_before_cess > 0 else 0.0
    tax_payable = tax_before_cess + cess_amount

    # Tax Deducted so far (TDS)
    tds_deducted = tot_it_advance

    # Balance or Refund
    if tax_payable >= tds_deducted:
        balance_tax_feb = tax_payable - tds_deducted
        tax_refund = 0.0
    else:
        balance_tax_feb = 0.0
        tax_refund = tds_deducted - tax_payable

    # Split balance into tax and cess
    balance_tax_only = round((balance_tax_feb / 104.0) * 100.0) if balance_tax_feb > 0 else 0.0
    balance_cess_only = balance_tax_feb - balance_tax_only

    return {
        "employee_info": {
            "name": name,
            "sex": sex,
            "designation": designation,
            "pan_number": pan_number,
            "tan_number": tan_number,
            "phone": phone,
            "whatsapp_number": whatsapp_number,
            "school_type": school_type,
            "school_name": school_name,
            "office_address": office_address,
            "financial_year": "2025- 2026",
            "assessment_year": "2026- 2027"
        },
        "monthly_rows": monthly_rows,
        "monthly_totals": {
            "basic": tot_basic,
            "da": tot_da,
            "oa": tot_oa,
            "hra": tot_hra,
            "cca": tot_cca,
            "ma": tot_ma,
            "sa": tot_sa,
            "gross": tot_monthly_gross,
            "it_advance": tot_it_advance
        },
        "additions": {
            "bonus": bonus,
            "da_arrears_1": da_arrears_1,
            "da_arrears_2": da_arrears_2,
            "surrender_total": surrender_total,
            "surrender_breakdown": {
                "month": surrender_month,
                "basic": surrender_basic,
                "da": surrender_da,
                "oa": surrender_oa,
                "hra": surrender_hra,
                "cca": surrender_cca
            },
            "selection_grade_arrears": sel_grade_arr
        },
        "gross_salary": gross_salary,
        "deductions": {
            "standard_deduction": std_deduction,
            "spl_transport_allowance": spl_transport_deduction,
            "total_deduction": total_deduction
        },
        "taxable_income": taxable_income,
        "tax_slabs": [
            {"label": "(i) Upto 400000 /-", "rate": "NIL", "amount": slab1_base, "tax": slab1_tax},
            {"label": "(ii) 400001 - 800000", "rate": "5%", "amount": slab2_base, "tax": slab2_tax},
            {"label": "(iii) 800001 - 1200000", "rate": "10%", "amount": slab3_base, "tax": slab3_tax},
            {"label": "(iv) 1200001 - 1600000", "rate": "15%", "amount": slab4_base, "tax": slab4_tax},
            {"label": "(v) 1600001 - 2000000", "rate": "20%", "amount": slab5_base, "tax": slab5_tax},
            {"label": "(vi) 2000001 - 2400000", "rate": "25%", "amount": slab6_base, "tax": slab6_tax},
            {"label": "(vii) 2400001 and above", "rate": "30%", "amount": slab7_base, "tax": slab7_tax}
        ],
        "tax_summary": {
            "total_tax_before_rebate": total_tax_before_rebate,
            "rebate_87a": rebate_87a,
            "marginal_relief_tax": marginal_relief_tax,
            "tax_before_cess": tax_before_cess,
            "cess_amount": cess_amount,
            "tax_payable": tax_payable,
            "tds_deducted": tds_deducted,
            "balance_tax_feb": balance_tax_feb,
            "balance_tax_only": balance_tax_only,
            "balance_cess_only": balance_cess_only,
            "tax_refund": tax_refund
        },
        "footer_text": "Generated by FrontierWox Tech Pvt Ltd Automation Suite"
    }
