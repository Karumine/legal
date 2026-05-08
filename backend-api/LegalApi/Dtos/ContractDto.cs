using System;
using System.Collections.Generic;

namespace LegalApi.Dtos
{
    public class ContractDto
    {
        public string ContractNo { get; set; } = string.Empty;
        public DateTime EffectiveDate { get; set; }
        public string? ContractType { get; set; }
        public string? MadeAt { get; set; }

        public decimal? OriginationFeeRate { get; set; }
        public decimal? ServiceFeeRate { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? DownPayment { get; set; }
        public decimal? RemainingAmount { get; set; }
        public int? Installments { get; set; }
        public decimal? InstallmentAmount { get; set; }
        public DateTime? FirstInstallmentDate { get; set; }
        public DateTime? LastInstallmentDate { get; set; }
        public string? PaymentDay { get; set; }
        public string? BusinessPurpose { get; set; }
        public string? InstallationLocation { get; set; }
        public decimal? StampDuty { get; set; }
        public decimal? InsurancePremium { get; set; }
        public string? GuaranteeAmountText { get; set; }
        public string? GuaranteeAmountNumber { get; set; }
        public decimal? InterestRate { get; set; }
        public string? InterestType { get; set; }
        public decimal? PenaltyRate { get; set; }
        public string? Witnesses { get; set; }
        public string? MetadataJson { get; set; }

        // Party 1 (Company)
        public PartyDto Party1 { get; set; } = null!;

        // Party 2 (Customer)
        public PartyDto Party2 { get; set; } = null!;

        public List<ContractItemDto> Items { get; set; } = new();
        public List<GuarantorDto> Guarantors { get; set; } = new();
    }

    public class PartyDto
    {
        public string Name { get; set; } = string.Empty;
        public string? TaxId { get; set; }
        public string? Address { get; set; }
        public string? PostalCode { get; set; }
        public string? Directors { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? ContactPerson { get; set; }
        public string? EntityType { get; set; }
    }

    public class ContractItemDto
    {
        public string? AgreementId { get; set; }
        public string? ItemType { get; set; }
        public string? ContractNoRef { get; set; }
        public DateTime? RefDate { get; set; }
        public string? Description { get; set; }
        public string? Quantity { get; set; }
        public string? Unit { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal Amount { get; set; }
        public decimal Rate { get; set; }
        public string? MetadataJson { get; set; }
    }

    public class GuarantorDto
    {
        public string Name { get; set; } = string.Empty;
        public string? IdCard { get; set; }
        public string? Address { get; set; }
        public string? PostalCode { get; set; }
        public string? Phone { get; set; }
        public string? Type { get; set; }
        public string? Directors { get; set; }
        public bool IsMarried { get; set; }
        public string? SpouseName { get; set; }
        public string? SpouseIdCard { get; set; }
        public string? SpouseAddress { get; set; }
        public string? SpousePostalCode { get; set; }
        public string? MetadataJson { get; set; }
    }
}
