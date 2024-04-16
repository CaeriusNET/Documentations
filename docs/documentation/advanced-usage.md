# Advanced Usage

On this page, we will cover some advanced usage of the `Caerius.NET` library.  
 - [Using Table-Valued Parameters](#table-valued-parameters)

## Table-Valued Parameters

Table-Valued Parameters (TVP) are a powerful feature of SQL Server added in version 2008. They allow you to pass a table as a parameter to a stored procedure.  

This possibility was added by [`ADO.NET`](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/sql/) in version 4.5, and `Caerius.NET` supports it.  

This was possible with the [`DataTable`](https://learn.microsoft.com/en-us/dotnet/api/system.data.datatable?view=net-8.0) object, but it was not very convenient.  

::: tip
The main profit of using TVP is to send a HEAVY set of data to the database in one call, like a big list of (Ids, Guid, ...), instead of sending each row one by one.
:::

## How to use TVP with Caerius.NET

To use TVP with `Caerius.NET`, you need to create on your database a new type of table, like this:

```sql
CREATE TYPE dbo.tvp_int AS TABLE(
    Id int NOT NULL
)
```

Then, you can use this type in your stored procedure:

```sql
CREATE PROCEDURE dbo.sp_GetUsers_By_Tvp_Ids
    @Ids dbo.tvp_int READONLY
AS
BEGIN
    SELECT Id, Username, Points
    FROM dbo.Users
    WHERE Id 
        IN (SELECT Id FROM @Ids)
END
```

And finally, in your C# code, you need to do two things:

1. Create a class that will represent the TVP type:
2. Use the `StoredProcedureParametersBuilder` to create the parameters for the stored procedure.

Here is an example:
::: code-group
```csharp [TVP creation]
namespace TestProject.Models.Tvps;

public sealed record UsersIdsTvp(int Id)
    : ITvpMapper<UsersIdsTvp>
{
    public DataTable MapToDataTable(IEnumerable<UsersIdsTvp> items)
    {
        var dataTable = new DataTable("dbo.tvp_int");
        dataTable.Columns.Add("Id", typeof(int));

        foreach (var tvp in items) dataTable.Rows.Add(tvp.Id);

        return dataTable;
    }
}
```
```csharp [Service]
using CaeriusNET.Models.Tvps;

namespace TestProject.Services;

public sealed record UsersService(ICustomUsersRepository CustomUsersRepository)
    : IUsersService
{
    private readonly Random _random = new();

    public async Task<IEnumerable<CustomUsersDto>> GetUsersByTvpIds(IEnumerable<UsersDto> users)
    {
        var usersToGet = users
            .Take(4242)
            .Select(u => new UsersIdsTvp(u.Id))
            .ToList();
            
        var users = await CustomUsersRepository.GetUsersByTvpIds(usersToGet);
        
        return users;
    }
}
```
```csharp [Repository]
using CaeriusNET.Models.Tvps;

namespace TestProject.Repositories;

public sealed record CustomUsersRepository(ICaeriusDbConnectionFactory Caerius)
    : ICustomUsersRepository
{
    public async Task<IEnumerable<CustomUsersDto>> GetUsersByTvpIds(IEnumerable<UsersIdsTvp> users)
    {
        var parameters = new StoredProcedureParametersBuilder("dbo.sp_GetUsers_By_Tvp_Ids", 4242);
            .AddTableValuedParameter("Ids", "dbo.tvp_int", users);

        var users = await Caerius.QueryAsync<CustomUsersDto>("dbo.sp_GetUsers_By_Tvp_Ids", parameters);
        
        return users;
    }
}
```