using LegalApi.Data;
using LegalApi.Dtos;
using LegalApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LegalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContractsController : ControllerBase
    {
        private readonly LegalDbContext _context;

        public ContractsController(LegalDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/contracts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contract>>> GetContracts()
        {
            return await _context.Contracts
                .Include(c => c.Party1)
                .Include(c => c.Party2)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        // 2. GET: api/contracts/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Contract>> GetContract(Guid id)
        {
            var contract = await _context.Contracts
                .Include(c => c.Party1)
                .Include(c => c.Party2)
                .Include(c => c.Items)
                .Include(c => c.Guarantors)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contract == null)
            {
                return NotFound();
            }

            return contract;
        }

        // 3. POST: api/contracts
        [HttpPost]
        public async Task<ActionResult<Contract>> CreateContract(ContractDto dto)
        {
            // Create or Find Parties (Simplified: always create for now, or match by TaxId)
            var party1 = new Party
            {
                Name = dto.Party1.Name,
                TaxId = dto.Party1.TaxId,
                Address = dto.Party1.Address,
                PostalCode = dto.Party1.PostalCode,
                Directors = dto.Party1.Directors,
                Phone = dto.Party1.Phone,
                Email = dto.Party1.Email,
                ContactPerson = dto.Party1.ContactPerson,
                EntityType = dto.Party1.EntityType
            };

            var party2 = new Party
            {
                Name = dto.Party2.Name,
                TaxId = dto.Party2.TaxId,
                Address = dto.Party2.Address,
                PostalCode = dto.Party2.PostalCode,
                Directors = dto.Party2.Directors,
                Phone = dto.Party2.Phone,
                Email = dto.Party2.Email,
                ContactPerson = dto.Party2.ContactPerson,
                EntityType = dto.Party2.EntityType
            };

            _context.Parties.AddRange(party1, party2);

            var contract = new Contract
            {
                ContractNo = dto.ContractNo,
                EffectiveDate = dto.EffectiveDate,
                ContractType = dto.ContractType,
                MadeAt = dto.MadeAt,
                OriginationFeeRate = dto.OriginationFeeRate,
                ServiceFeeRate = dto.ServiceFeeRate,
                TotalAmount = dto.TotalAmount,
                DownPayment = dto.DownPayment,
                RemainingAmount = dto.RemainingAmount,
                Installments = dto.Installments,
                InstallmentAmount = dto.InstallmentAmount,
                FirstInstallmentDate = dto.FirstInstallmentDate,
                LastInstallmentDate = dto.LastInstallmentDate,
                PaymentDay = dto.PaymentDay,
                BusinessPurpose = dto.BusinessPurpose,
                InstallationLocation = dto.InstallationLocation,
                StampDuty = dto.StampDuty,
                InsurancePremium = dto.InsurancePremium,
                GuaranteeAmountText = dto.GuaranteeAmountText,
                GuaranteeAmountNumber = dto.GuaranteeAmountNumber,
                InterestRate = dto.InterestRate,
                InterestType = dto.InterestType,
                PenaltyRate = dto.PenaltyRate,
                Witnesses = dto.Witnesses,
                MetadataJson = dto.MetadataJson,
                Party1 = party1,
                Party2 = party2,
                CreatedAt = DateTime.UtcNow
            };

            // Add Items
            foreach (var itemDto in dto.Items)
            {
                contract.Items.Add(new ContractItem
                {
                    AgreementId = itemDto.AgreementId,
                    ItemType = itemDto.ItemType,
                    ContractNoRef = itemDto.ContractNoRef,
                    RefDate = itemDto.RefDate,
                    Description = itemDto.Description,
                    Quantity = itemDto.Quantity,
                    Unit = itemDto.Unit,
                    UnitPrice = itemDto.UnitPrice,
                    Amount = itemDto.Amount,
                    Rate = itemDto.Rate,
                    MetadataJson = itemDto.MetadataJson
                });
            }

            // Add Guarantors
            foreach (var gDto in dto.Guarantors)
            {
                contract.Guarantors.Add(new Guarantor
                {
                    Name = gDto.Name,
                    IdCard = gDto.IdCard,
                    Address = gDto.Address,
                    PostalCode = gDto.PostalCode,
                    Phone = gDto.Phone,
                    Type = gDto.Type,
                    Directors = gDto.Directors,
                    IsMarried = gDto.IsMarried,
                    SpouseName = gDto.SpouseName,
                    SpouseIdCard = gDto.SpouseIdCard,
                    SpouseAddress = gDto.SpouseAddress,
                    SpousePostalCode = gDto.SpousePostalCode,
                    MetadataJson = gDto.MetadataJson
                });
            }

            _context.Contracts.Add(contract);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, contract);
        }
    }
}
