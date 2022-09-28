/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, renderHook } from "@testing-library/react-hooks";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import mockConnection from "test-utils/mock-data/mockConnection.json";
import mockDest from "test-utils/mock-data/mockDestinationDefinition.json";
import { TestWrapper } from "test-utils/testutils";

import { WebBackendConnectionUpdate } from "core/request/AirbyteClient";

import { useConnectionFormService } from "../ConnectionForm/ConnectionFormService";
import { ModalServiceProvider } from "../Modal";
import { ConnectionEditServiceProvider, useConnectionEditService } from "./ConnectionEditService";

jest.mock("services/connector/DestinationDefinitionSpecificationService", () => ({
  useGetDestinationDefinitionSpecification: () => mockDest,
}));

jest.mock("../useConnectionHook", () => ({
  useGetConnection: () => mockConnection,
  useWebConnectionService: () => ({
    getConnection: () => mockConnection,
  }),
  useUpdateConnection: () => ({
    mutateAsync: jest.fn(async (connection: WebBackendConnectionUpdate) => connection),
    isLoading: false,
  }),
}));

describe("ConnectionFormService", () => {
  const Wrapper: React.FC<Parameters<typeof ConnectionEditServiceProvider>[0]> = ({ children, ...props }) => (
    <TestWrapper>
      <MemoryRouter>
        <ModalServiceProvider>
          <ConnectionEditServiceProvider {...props}>{children}</ConnectionEditServiceProvider>
        </ModalServiceProvider>
      </MemoryRouter>
    </TestWrapper>
  );

  const refreshSchema = jest.fn();

  beforeEach(() => {
    refreshSchema.mockReset();
  });

  it("should load a Connection from a connectionId", async () => {
    const { result } = renderHook(useConnectionEditService, {
      wrapper: Wrapper,
      initialProps: {
        connectionId: mockConnection.connectionId,
      },
    });

    expect(result.current.connection).toEqual(mockConnection);
  });

  it("should update a connection and set the current connection object to the updated connection", async () => {
    const { result } = renderHook(useConnectionEditService, {
      wrapper: Wrapper,
      initialProps: {
        connectionId: mockConnection.connectionId,
      },
    });

    const mockUpdateConnection: unknown = {
      status: "asdf",
      destination: {},
      source: {},
      syncCatalog: { streams: [] },
    };

    await act(async () => {
      await result.current.updateConnection(mockUpdateConnection as WebBackendConnectionUpdate);
    });

    expect(result.current.connection).toEqual(mockUpdateConnection);
  });

  it("should refresh connection", async () => {
    // Need to combine the hooks so both can be used.
    const useMyTestHook = () => {
      return [useConnectionEditService(), useConnectionFormService()] as const;
    };

    const { result } = renderHook(useMyTestHook, {
      wrapper: Wrapper,
      initialProps: {
        connectionId: mockConnection.connectionId,
      },
    });

    const mockUpdateConnection: unknown = {
      status: "asdf",
      destination: {},
      source: {},
      syncCatalog: { streams: [] },
    };

    await act(async () => {
      await result.current[0].updateConnection(mockUpdateConnection as WebBackendConnectionUpdate);
    });

    expect(result.current[0].connection).toEqual(mockUpdateConnection);

    await act(async () => {
      await result.current[1].refreshSchema();
    });

    expect(result.current[0].schemaHasBeenRefreshed).toBe(true);
    expect(result.current[0].connection).toEqual(mockConnection);
  });
});
