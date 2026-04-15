-- Create Customers table
CREATE TABLE Customers (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255),
    Phone NVARCHAR(50),
    Address NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create SuratJalan table
CREATE TABLE SuratJalan (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Number NVARCHAR(50) NOT NULL UNIQUE,
    CustomerId INT FOREIGN KEY REFERENCES Customers(Id),
    Date DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(50) DEFAULT 'Pending',
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Create Invoices table
CREATE TABLE Invoices (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Number NVARCHAR(50) NOT NULL UNIQUE,
    CustomerId INT FOREIGN KEY REFERENCES Customers(Id),
    SuratJalanId INT FOREIGN KEY REFERENCES SuratJalan(Id),
    Date DATETIME DEFAULT GETDATE(),
    DueDate DATETIME,
    TotalAmount DECIMAL(18, 2) DEFAULT 0,
    Status NVARCHAR(50) DEFAULT 'Unpaid',
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Sample Data
INSERT INTO Customers (Name, Email, Phone, Address) VALUES 
('PT Maju Jaya', 'info@majujaya.com', '021-1234567', 'Jl. Sudirman No. 1, Jakarta'),
('CV Sumber Makmur', 'contact@sumbermakmur.co.id', '031-7654321', 'Jl. Basuki Rahmat No. 10, Surabaya');
