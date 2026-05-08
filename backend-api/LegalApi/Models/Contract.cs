using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LegalApi.Models
{
    public class Contract
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string ContractNo { get; set; } = string.Empty;

        public DateTime EffectiveDate { get; set; }
        public string? ContractType { get; set; } // 'ServiceAgreement', 'Guarantee', etc.
        public string? MadeAt { get; set; }

        // Relationships
        public Guid Party1Id { get; set; }
        [ForeignKey("Party1Id")]
        public Party Party1 { get; set; } = null!;

        public Guid Party2Id { get; set; }
        // Financial & Installments
        public decimal? TotalAmount { get; set; }
        public decimal? DownPayment { get; set; }
        public decimal? RemainingAmount { get; set; }
        public int? Installments { get; set; }
        public decimal? InstallmentAmount { get; set; }
        public DateTime? FirstInstallmentDate { get; set; }
        public DateTime? LastInstallmentDate { get; set; }
        public string? PaymentDay { get; set; }

        // Legal & Technical
        public string? BusinessPurpose { get; set; }
        public string? InstallationLocation { get; set; }
        public decimal? StampDuty { get; set; }
        public decimal? InsurancePremium { get; set; }
        public string? GuaranteeAmountText { get; set; }
        public string? GuaranteeAmountNumber { get; set; }
        public string? Witnesses { get; set; }

        // Rates
        public decimal? InterestRate { get; set; }
        public string? InterestType { get; set; }
        public decimal? PenaltyRate { get; set; }
        public decimal? OriginationFeeRate { get; set; }
        public decimal? ServiceFeeRate { get; set; }

        // JSON Metadata for any extra fields (Buyback conditions, custom clauses, etc.)
        public string? MetadataJson { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public List<ContractItem> Items { get; set; } = new();
        public List<Guarantor> Guarantors { get; set; } = new();
    }
}
