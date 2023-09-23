namespace Backend.Features.Customer
{
    public class CustomerListQuery : IRequest<List<CustomerListQueryResponse>>
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
    }

    public class CustomerListQueryResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Address { get; set; } = "";
        public string Email { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Iban { get; set; } = "";
        public CustomerListQueryResponseDepartment? Department { get; set; }
    }

    public class CustomerListQueryResponseDepartment
    {
        public string Code { get; set; } = "";
        public string Description { get; set; } = "";
    }

    internal class CustomerListQueryHandler : IRequestHandler<CustomerListQuery, List<CustomerListQueryResponse>>
    {
        private readonly BackendContext context;

        public CustomerListQueryHandler(BackendContext context)
        {
            this.context = context;
        }

        public async Task<List<CustomerListQueryResponse>> Handle(CustomerListQuery request, CancellationToken cancellationToken)
        {
            var query = context.Customers.AsQueryable();

            if (!string.IsNullOrEmpty(request.Name))
                query = query.Where(q => q.Name.ToLower().Contains(request.Name.ToLower()));

            if (!string.IsNullOrEmpty(request.Email))
                query = query.Where(q => q.Email.ToLower().Contains(request.Email.ToLower()));

            var data = await query.OrderBy(q => q.Name).ToListAsync(cancellationToken);
            var result = new List<CustomerListQueryResponse>();

            foreach (var item in data)
            {
                var resultItem = new CustomerListQueryResponse
                {
                    Id = item.Id,
                    Name = item.Name,
                    Address = item.Address,
                    Email = item.Email,
                    Phone = item.Phone,
                    Iban = item.Iban,
                    Department = await context.Departments
                        .Where(q => q.Id == item.CustomerCategoryId)
                        .Select(q => new CustomerListQueryResponseDepartment { Code = q.Code, Description = q.Description })
                        .SingleOrDefaultAsync(cancellationToken),
                };

                result.Add(resultItem);
            }

            return result;
        }
    }
}
